import { describe, expect, it, vi } from 'vitest'
import { apiBaseUrl } from './env'

describe('apiBaseUrl', () => {
  it('falls back to the local backend when unset', () => {
    vi.stubEnv('VITE_API_BASE_URL', '')
    expect(apiBaseUrl()).toBe('http://localhost:8080')
    vi.unstubAllEnvs()
  })

  it('uses the configured base URL', () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.farmish.gh')
    expect(apiBaseUrl()).toBe('https://api.farmish.gh')
    vi.unstubAllEnvs()
  })
})
