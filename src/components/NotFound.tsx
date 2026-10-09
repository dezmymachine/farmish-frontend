import { Link, useRouterState } from '@tanstack/react-router'

export function NotFound() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  return (
    <main className="mx-auto max-w-2xl px-4 py-16 text-center">
      <p className="t-detail text-ink-faint">404</p>
      <h1 className="t-title-lg mt-2 text-ink">Page not found</h1>
      <p className="t-body mt-2 text-ink-soft">
        No page exists at <code className="t-code">{pathname}</code>.
      </p>
      <Link to="/" className="t-body mt-6 inline-block text-accent underline">
        Back to home
      </Link>
    </main>
  )
}
