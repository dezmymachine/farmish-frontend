import * as React from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import type { Auth, User } from 'firebase/auth'
import { onIdTokenChanged, signOut as firebaseSignOut } from 'firebase/auth'
import { createQueryClient } from '~/api/query-client'
import { qk } from '~/api/query-keys'
import { setTokenProvider } from '~/api/client'
import { getFirebaseAuth, isFirebaseConfigured } from './firebase'
import { ReauthDialog } from './ReauthDialog'

/*
 * Session state for the whole app. Owns the per-session QueryClient so the
 * global auth net (`reauth_required` → dialog, `unauthorized` → sign-in)
 * can reach the router, and wires the API client's Bearer-token provider
 * to the Firebase user. Firebase persistence is the SDK default (IndexedDB);
 * tokens are never written to localStorage by hand.
 *
 * Note on 401s: the client always sends a fresh `getIdToken()`, so an
 * `unauthorized` means the session is revoked or disabled — the one correct
 * move is sign-in, not a silent retry loop.
 */

interface AuthContextValue {
  /** Null until sign-in; also null on the server and when unconfigured. */
  user: User | null
  /** True until the first `onIdTokenChanged` fires (false on server). */
  initializing: boolean
  /** False when the web config is missing — forms render unavailable. */
  isConfigured: boolean
  signOut: () => Promise<void>
  requestReauth: () => void
}

const AuthContext = React.createContext<AuthContextValue>({
  user: null,
  initializing: true,
  isConfigured: false,
  signOut: () => Promise.resolve(),
  requestReauth: () => {},
})

export function useAuth(): AuthContextValue {
  return React.useContext(AuthContext)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = React.useState<User | null>(null)
  const configured = isFirebaseConfigured()
  const [initializing, setInitializing] = React.useState(() => typeof window !== 'undefined' && configured)
  const [reauthOpen, setReauthOpen] = React.useState(false)
  // Singleton-guarded and SSR-safe (null on the server / unconfigured).
  const [authInstance] = React.useState<Auth | null>(() => getFirebaseAuth())
  const [queryClient] = React.useState<QueryClient>(() =>
    createQueryClient({
      onUnauthorized: () => {
        void router.navigate({ to: '/sign-in' })
      },
      onReauthRequired: () => {
        setReauthOpen(true)
      },
    }),
  )

  React.useEffect(() => {
    const auth = authInstance
    if (auth === null) return
    setTokenProvider(() => {
      const current = auth.currentUser
      return current === null ? Promise.resolve(null) : current.getIdToken()
    })
    const unsubscribe = onIdTokenChanged(
      auth,
      (next) => {
        setUser(next)
        setInitializing(false)
        void queryClient.invalidateQueries({ queryKey: qk.me.all })
      },
      () => {
        setUser(null)
        setInitializing(false)
      },
    )
    return unsubscribe
  }, [authInstance, queryClient])

  const signOut = React.useCallback(async () => {
    if (authInstance !== null) {
      await firebaseSignOut(authInstance)
    }
    setUser(null)
    setTokenProvider(() => Promise.resolve(null))
    queryClient.removeQueries({ queryKey: qk.me.all })
  }, [queryClient, authInstance])

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      initializing,
      isConfigured: configured,
      signOut,
      requestReauth: () => {
        setReauthOpen(true)
      },
    }),
    [user, initializing, configured, signOut],
  )

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={value}>
        {children}
        <ReauthDialog
          open={reauthOpen}
          user={user}
          auth={authInstance}
          onClose={() => {
            setReauthOpen(false)
          }}
          onReauthed={() => {
            setReauthOpen(false)
            void queryClient.invalidateQueries()
          }}
        />
      </AuthContext.Provider>
    </QueryClientProvider>
  )
}
