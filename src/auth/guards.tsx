import * as React from 'react'
import { Navigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { meQueryOptions } from '~/api/queries/me'
import { useAuth } from './AuthProvider'
import { hasSessionHint } from './session-hint'

/*
 * Route guards. The redirect *decisions* are pure helpers (unit-tested
 * matrix in guards.test.ts); the components apply them. After sign-in
 * users always land on /account — no deep-link return in F2.
 */

/** Where an unauthenticated visitor goes, or null when they may stay. */
export function signInRedirect(opts: { initializing: boolean; userUid: string | null }): '/sign-in' | null {
  if (!opts.initializing && opts.userUid === null) return '/sign-in'
  return null
}

/**
 * Where a visitor to an admin route goes: sign-in when logged out,
 * /account when the role has loaded and is not admin, else null.
 */
export function adminRedirect(opts: {
  initializing: boolean
  userUid: string | null
  role: string | null | undefined
  rolePending: boolean
}): '/sign-in' | '/account' | null {
  const signedOut = signInRedirect(opts)
  if (signedOut !== null) return signedOut
  if (!opts.rolePending && opts.role !== 'admin') return '/account'
  return null
}

/** Wrap any signed-in page. Logged-out visitors redirect almost instantly. */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const mounted = useMounted()
  const { user, initializing } = useAuth()
  // First client paint MUST equal the SSR tree (the loading line): the
  // server cannot know the session, and anything else hydrates mismatched
  // (React #418) — including redirecting a paint early. Past hydration the
  // hint decides synchronously, so logged-out visitors leave after a single
  // loading frame instead of waiting on the Firebase restore.
  if (!mounted) return <AuthLoadingFallback />
  const settled = !initializing || !hasSessionHint()
  if (!settled) return <AuthLoadingFallback />
  const to = signInRedirect({ initializing: false, userUid: user?.uid ?? null })
  if (to !== null) return <Navigate to={to} />
  return <React.Suspense fallback={<AuthLoadingFallback />}>{children}</React.Suspense>
}

/** Placeholder while the session settles. Shared so SSR and hydration match. */
export function AuthLoadingFallback() {
  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <p className="t-body text-ink-soft">Loading your account…</p>
    </main>
  )
}

/** False on the server and on the very first client paint, true after. */
function useMounted(): boolean {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mount gate: first paint must match SSR
    setMounted(true)
  }, [])
  return mounted
}

/** Wrap admin pages. Role comes from GET /v1/me — never from the client. */
export function RequireAdmin({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <AdminRoleGate>{children}</AdminRoleGate>
    </RequireAuth>
  )
}

function AdminRoleGate({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const roleQuery = useQuery({ ...meQueryOptions(), enabled: user !== null })
  if (roleQuery.isPending) return null
  const to = adminRedirect({
    initializing: false,
    userUid: user?.uid ?? null,
    role: roleQuery.data?.role,
    rolePending: false,
  })
  if (to !== null) return <Navigate to={to} />
  return <>{children}</>
}
