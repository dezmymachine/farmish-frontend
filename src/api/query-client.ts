import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import { ApiError } from '~/lib/errors'

/** Client errors that a retry cannot fix. */
const NO_RETRY_STATUS = new Set([400, 401, 403, 404, 409, 422])

const STALE_DEFAULT = 60_000

export interface GlobalQueryHandlers {
  /** 401 `unauthorized`: refresh the token once, then send to sign-in. */
  onUnauthorized: () => void
  /** 401 `reauth_required`: open the step-up re-auth dialog. */
  onReauthRequired: () => void
}

const noopHandlers: GlobalQueryHandlers = {
  onUnauthorized: () => {},
  onReauthRequired: () => {},
}

/** Route a failed query/mutation to the global auth net. Returns true if handled. */
export function handleGlobalError(error: unknown, handlers: GlobalQueryHandlers): boolean {
  if (!(error instanceof ApiError)) return false
  if (error.code === 'reauth_required') {
    handlers.onReauthRequired()
    return true
  }
  if (error.isUnauthorized) {
    handlers.onUnauthorized()
    return true
  }
  return false
}

/**
 * Per-session QueryClient. Create one per app session (never a module
 * singleton shared across SSR requests) and provide it at the root.
 * F2 wires the real `onUnauthorized`/`onReauthRequired` handlers.
 */
export function createQueryClient(handlers: Partial<GlobalQueryHandlers> = {}): QueryClient {
  const merged: GlobalQueryHandlers = { ...noopHandlers, ...handlers }
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error) => {
        handleGlobalError(error, merged)
      },
    }),
    mutationCache: new MutationCache({
      onError: (error) => {
        handleGlobalError(error, merged)
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: STALE_DEFAULT,
        gcTime: Infinity,
        refetchOnWindowFocus: false,
        retry: (count, error) => {
          if (error instanceof ApiError && NO_RETRY_STATUS.has(error.status)) return false
          return count < 2
        },
      },
      mutations: {
        retry: false,
      },
    },
  })
}
