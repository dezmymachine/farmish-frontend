import { Link, useRouterState } from '@tanstack/react-router'

export function DefaultCatchBoundary({ error }: { error: unknown }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const message = error instanceof Error ? error.message : 'Something went wrong.'
  return (
    <main className="mx-auto max-w-2xl px-4 py-16 text-center">
      <h1 className="t-title-lg text-ink">Something went wrong</h1>
      <p className="t-body mt-2 text-ink-soft">{message}</p>
      <p className="t-detail mt-1 text-ink-faint">
        While loading <code className="t-code">{pathname}</code>
      </p>
      <Link to="/" className="t-body mt-6 inline-block text-accent underline">
        Back to home
      </Link>
    </main>
  )
}
