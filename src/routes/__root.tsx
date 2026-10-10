/// <reference types="vite/client" />
import { HeadContent, Link, Scripts, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import * as React from 'react'
import { Sprout } from 'lucide-react'
import { AuthProvider, useAuth } from '~/auth/AuthProvider'
import { DefaultCatchBoundary } from '~/components/DefaultCatchBoundary'
import { NotFound } from '~/components/NotFound'
import appCss from '~/styles/app.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Farmish Ghana — Seeds, Inputs, Machinery & More' },
      {
        name: 'description',
        content:
          "Ghana's agricultural marketplace: buy and sell seeds, fertilizers, machinery, livestock and fresh produce.",
      },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Google+Sans+Flex:opsz,wght@6..144,1..1000&display=swap',
      },
    ],
  }),
  errorComponent: DefaultCatchBoundary,
  notFoundComponent: () => <NotFound />,
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <AuthProvider>
          <header className="border-b border-line bg-paper">
            <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
              <Link to="/" className="flex items-center gap-2" aria-label="Farmish home">
                <span className="grid size-9 place-items-center rounded-pill bg-accent text-on-accent">
                  <Sprout className="size-5" aria-hidden="true" />
                </span>
                <span className="t-title text-ink">Farmish</span>
              </Link>
              <nav className="t-ui ml-auto flex items-center gap-4" aria-label="Primary">
                <Link
                  to="/"
                  activeProps={{ className: 'font-bold' }}
                  activeOptions={{ exact: true }}
                  className="text-ink-faint hover:text-ink"
                >
                  Home
                </Link>
                <AuthLink />
              </nav>
            </div>
          </header>
          {children}
          <footer className="mt-16 border-t border-line">
            <div className="t-detail mx-auto max-w-5xl px-4 py-6 text-ink-faint">
              Farmish Ghana — the agricultural marketplace.
            </div>
          </footer>
        </AuthProvider>
        <TanStackRouterDevtools position="bottom-right" />
        <Scripts />
      </body>
    </html>
  )
}

function AuthLink() {
  const { user, initializing } = useAuth()
  if (!initializing && user !== null) {
    return (
      <Link to="/account" activeProps={{ className: 'font-bold' }} className="text-ink-faint hover:text-ink">
        Account
      </Link>
    )
  }
  return (
    <Link to="/sign-in" activeProps={{ className: 'font-bold' }} className="text-ink-faint hover:text-ink">
      Sign in
    </Link>
  )
}
