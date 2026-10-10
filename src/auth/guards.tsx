import * as React from 'react'
import { Navigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { meQueryOptions } from '~/api/queries/me'
import { useAuth } from './AuthProvider'
import { hasSessionHint } from './session-hint'

/*
 * Route guards. The redirect *decisions* are pure helpers (unit-tested
 * matrix below in guards.test.ts); the components apply them. After
 * sign-in users always land on /account — no deep-link return in F2.
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

/** Wrap any signed-in page. Logged-out visitors redirect on first render. */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, initializing } = useAuth()
  // Null on the server and while the SDK restores a hinted session: both
  // render identical (empty) trees, so hydration always matches. A missing
  // hint means definitely logged out — decide synchronously, no flash.
  if (typeof window === 'undefined') return null
  const settled = !initializing || !hasSessionHint()
  if (!settled) return null
  const to = signInRedirect({ initializing: false, userUid: user?.uid ?? null })
  if (to !== null) return <Navigate to={to} />
  return <React.Suspense fallback={null}>{children}</React.Suspense>
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
