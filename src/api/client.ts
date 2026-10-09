import createClient from 'openapi-fetch'
import type { paths } from './schema'
import { ApiError } from '~/lib/errors'
import { apiBaseUrl } from '~/lib/env'

/*
 * The only module that talks HTTP. openapi-fetch over generated types
 * (never hand-written API types) + a Bearer-token middleware + envelope
 * normalisation into ApiError.
 *
 * Auth is injected: F2's AuthProvider calls `setTokenProvider` with
 * `() => user?.getIdToken() ?? null`. F1 stays Firebase-free and testable.
 *
 * The client is created lazily (not at module import): openapi-fetch
 * captures `globalThis.fetch` when created, so import-time creation would
 * freeze the reference before MSW patches it in tests — and before the
 * environment is final. Always call through `getClient()` / `request()`.
 */

type TokenProvider = () => Promise<string | null>

let tokenProvider: TokenProvider = async () => null

export function setTokenProvider(fn: TokenProvider): void {
  tokenProvider = fn
}

type FarmishClient = ReturnType<typeof createClient<paths>>

let cached: FarmishClient | null = null

export function getClient(): FarmishClient {
  if (!cached) {
    cached = createClient<paths>({ baseUrl: apiBaseUrl() })
    cached.use({
      onRequest: async ({ request: req }) => {
        const token = await tokenProvider()
        if (token !== null) {
          req.headers.set('Authorization', `Bearer ${token}`)
        }
        return req
      },
    })
  }
  return cached
}

/** For tests that need a fresh client (new base URL / middleware state). */
export function resetClient(): void {
  cached = null
}

interface FetchResult<T> {
  data: T | undefined
  error: unknown
  response: Response
}

/**
 * Run one generated-client call and return the unwrapped data.
 * Non-2xx responses throw ApiError (parsed envelope); transport failures
 * throw ApiError(0, 'network_error'). Usage:
 *   request(() => getClient().GET('/v1/me'))
 */
export async function request<T>(doRequest: () => Promise<FetchResult<T>>): Promise<T> {
  let result: FetchResult<T>
  try {
    result = await doRequest()
  } catch {
    throw new ApiError(0, 'network_error', 'Could not reach the server', undefined)
  }
  if (result.error !== undefined || !result.response.ok) {
    throw ApiError.fromBody(result.response.status, result.error)
  }
  return result.data as T
}
