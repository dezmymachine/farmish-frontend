/// <reference types="vite/client" />
import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import * as React from 'react'
import { AuthProvider } from '~/auth/AuthProvider'
import { Navbar } from '~/components/layout/Navbar'
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
          <HydrationMarker />
          <Navbar />
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

/*
 * Marks hydration for e2e: SSR HTML is clickable before React attaches
 * listeners, so interaction tests wait for `html[data-hydrated]` instead
 * of racing (and losing to) a cold hydrate.
 */
function HydrationMarker() {
  React.useEffect(() => {
    document.documentElement.dataset.hydrated = 'true'
  }, [])
  return null
}
