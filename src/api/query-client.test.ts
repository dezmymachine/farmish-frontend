import { describe, expect, it, vi } from 'vitest'
import { createQueryClient, handleGlobalError } from './query-client'
import { STALE_TIERS, qk } from './query-keys'
import { ApiError } from '~/lib/errors'

describe('query keys', () => {
  it('builds hierarchical keys for broad or narrow invalidation', () => {
    expect(qk.listings.all).toEqual(['listings'])
    expect(qk.listings.list({ q: 'maize' })[0]).toBe('listings')
    expect(qk.listings.detail('abc')).toEqual(['listings', 'detail', 'abc'])
  })

  it('tiers order reference above working above live', () => {
    expect(STALE_TIERS.reference).toBeGreaterThan(STALE_TIERS.working)
    expect(STALE_TIERS.working).toBeGreaterThan(STALE_TIERS.live)
  })
})

describe('query client', () => {
  it('applies the shared defaults', () => {
    const qc = createQueryClient()
    const defaults = qc.getDefaultOptions()
    expect(defaults.queries?.staleTime).toBe(60_000)
    expect(defaults.queries?.gcTime).toBe(Infinity)
    expect(defaults.queries?.refetchOnWindowFocus).toBe(false)
    expect(defaults.mutations?.retry).toBe(false)
  })

  it('never retries client errors', () => {
    const qc = createQueryClient()
    const retry = qc.getDefaultOptions().queries?.retry
    expect(typeof retry).toBe('function')
    if (typeof retry !== 'function') return
    const err = new ApiError(404, 'not_found', 'gone')
    expect(retry(0, err)).toBe(false)
    expect(retry(0, new Error('socket reset'))).toBe(true)
    expect(retry(2, new Error('socket reset'))).toBe(false)
  })

  it('routes auth failures to the global handlers', () => {
    const onUnauthorized = vi.fn()
    const onReauthRequired = vi.fn()
    const handlers = { onUnauthorized, onReauthRequired }
    expect(handleGlobalError(new ApiError(401, 'unauthorized', 'x'), handlers)).toBe(true)
    expect(onUnauthorized).toHaveBeenCalledOnce()
    expect(handleGlobalError(new ApiError(401, 'reauth_required', 'x'), handlers)).toBe(true)
    expect(onReauthRequired).toHaveBeenCalledOnce()
    expect(handleGlobalError(new ApiError(500, 'internal_error', 'x'), handlers)).toBe(false)
    expect(handleGlobalError(new Error('plain'), handlers)).toBe(false)
  })
})
