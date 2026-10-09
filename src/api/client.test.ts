import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import createUnreachableClient from 'openapi-fetch'
import type { paths } from './schema'
import { getClient, request, resetClient, setTokenProvider } from './client'
import { ApiError } from '~/lib/errors'

const server = setupServer(
  http.get('*/v1/me', ({ request: req }) => {
    const auth = req.headers.get('Authorization')
    if (auth !== 'Bearer test-token') {
      return HttpResponse.json(
        { error: { code: 'unauthorized', message: 'Missing or invalid token' } },
        { status: 401 },
      )
    }
    return HttpResponse.json({ id: 'u1', displayName: 'Ama' })
  }),
  http.get('*/v1/broken', () => HttpResponse.json({ error: { code: 'x', message: 'y' } }, { status: 500 })),
)

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})
afterEach(() => {
  server.resetHandlers()
  resetClient()
  void setTokenProvider(async () => null)
})
afterAll(() => {
  server.close()
})

describe('api client', () => {
  it('attaches the Bearer token from the provider', async () => {
    setTokenProvider(async () => 'test-token')
    const me = await request(() => getClient().GET('/v1/me'))
    expect(me).toMatchObject({ id: 'u1' })
  })

  it('normalises envelope errors into ApiError', async () => {
    setTokenProvider(async () => null)
    const failure = await request(() => getClient().GET('/v1/me')).then(
      () => 'resolved',
      (err: unknown) => err,
    )
    expect(failure).toBeInstanceOf(ApiError)
    expect((failure as ApiError).status).toBe(401)
    expect((failure as ApiError).code).toBe('unauthorized')
  })

  it('maps transport failures to network_error', async () => {
    const dead = createUnreachableClient<paths>({ baseUrl: 'http://127.0.0.1:9' })
    const failure = await request(() => dead.GET('/v1/me')).then(
      () => 'resolved',
      (err: unknown) => err,
    )
    expect(failure).toBeInstanceOf(ApiError)
    expect((failure as ApiError).status).toBe(0)
    expect((failure as ApiError).code).toBe('network_error')
  })
})
