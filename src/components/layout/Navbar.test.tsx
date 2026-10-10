import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import type * as React from 'react'
import { AuthProvider } from '~/auth/AuthProvider'
import { resetClient, setTokenProvider } from '~/api/client'
import { Navbar } from './Navbar'

/*
 * Navbar slice tests. The router is a minimal memory tree (dummy pages for
 * every Link target); the categories query is served by MSW so the menu
 * never waits on retries against a dead localhost:8080.
 */

const { authState } = vi.hoisted(() => ({
  authState: { user: null as { uid: string } | null, initializing: false },
}))

vi.mock('~/auth/AuthProvider', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~/auth/AuthProvider')>()
  return { ...actual, useAuth: () => authState }
})

const tree = {
  items: [
    {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Seeds & Seedlings',
      slug: 'seeds-seedlings',
      sortOrder: 1,
      children: [
        {
          id: '00000000-0000-0000-0000-000000000002',
          name: 'Cereal Seeds',
          slug: 'seeds-seedlings-cereal-seeds',
          sortOrder: 1,
          children: [],
        },
      ],
    },
    {
      id: '00000000-0000-0000-0000-000000000003',
      name: 'Irrigation Equipment',
      slug: 'irrigation',
      sortOrder: 12,
      children: [],
    },
  ],
}

const server = setupServer(http.get('*/v1/categories', () => HttpResponse.json(tree)))

beforeAll(() => {
  server.listen({ onUnhandledFrame: 'bypass' })
  // Radix NavigationMenu measures its viewport; jsdom has no ResizeObserver.
  if (typeof window.ResizeObserver === 'undefined') {
    window.ResizeObserver = class {
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
    }
  }
})
afterEach(() => {
  server.resetHandlers()
  resetClient()
  setTokenProvider(() => Promise.resolve(null))
  authState.user = null
  authState.initializing = false
  window.localStorage.clear()
})
afterAll(() => {
  server.close()
})

function blank(name: string) {
  return function Blank() {
    return <div>{name}</div>
  }
}

async function setupRouter() {
  const rootRoute = createRootRoute({
    component: () => (
      <AuthProvider>
        <Navbar />
        <Outlet />
      </AuthProvider>
    ),
  })
  const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: blank('home') })
  const searchRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/search',
    component: blank('search'),
  })
  const cartRoute = createRoute({ getParentRoute: () => rootRoute, path: '/cart', component: blank('cart') })
  const accountRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/account',
    component: blank('account'),
  })
  const signInRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/sign-in',
    component: blank('sign-in'),
  })
  const routeTree = rootRoute.addChildren([indexRoute, searchRoute, cartRoute, accountRoute, signInRoute])
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  await router.load()
  return router
}

describe('Navbar', () => {
  it('lays out logo left, nav + search centred, cart before auth on the right', async () => {
    const router = await setupRouter()
    render(<RouterProvider router={router} />)

    expect(screen.getByRole('link', { name: 'Farmish home' })).toBeVisible()
    expect(screen.getByAltText('Farmish')).toBeVisible()
    const center = screen.getByTestId('navbar-center')
    expect(center).toContainElement(screen.getByRole('link', { name: 'Home' }))
    expect(center).toContainElement(screen.getByRole('link', { name: 'Market' }))
    expect(center).toContainElement(screen.getByRole('button', { name: 'Categories' }))
    const searchbox = screen.getAllByPlaceholderText(/Search seeds/i)[0]
    expect(searchbox).toBeVisible()
    expect(center).toContainElement(searchbox as HTMLElement)
    expect(screen.getByRole('link', { name: /Cart/ })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Sign in' })).toBeVisible()

    const header = screen.getByRole('banner')
    expect(header).toHaveClass('bg-transparent')
    expect(header.className).not.toMatch(/bg-paper|border-b/)
    const order = ['Farmish home', 'Market', 'Cart', 'Sign in'].map((name) => header.innerHTML.indexOf(name))
    expect(order.every((pos) => pos >= 0)).toBe(true)
  })

  it('shows the accent Sign in button when logged out', async () => {
    const router = await setupRouter()
    render(<RouterProvider router={router} />)
    const signIn = screen.getByRole('link', { name: 'Sign in' })
    expect(signIn).toHaveAttribute('href', '/sign-in')
    expect(signIn.className).toMatch(/bg-accent/)
  })

  it('swaps Sign in for the profile icon when logged in', async () => {
    authState.user = { uid: 'u1' }
    const router = await setupRouter()
    render(<RouterProvider router={router} />)
    expect(screen.queryByRole('link', { name: 'Sign in' })).toBeNull()
    const profile = screen.getByRole('link', { name: 'Your account' })
    expect(profile).toHaveAttribute('href', '/account')
  })

  it('opens the Categories menu with the live tree on hover/click', async () => {
    const router = await setupRouter()
    render(<RouterProvider router={router} />)
    fireEvent.click(screen.getByRole('button', { name: 'Categories' }))
    expect(await screen.findByRole('link', { name: 'Seeds & Seedlings' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Cereal Seeds' })).toBeVisible()
  })

  it('navigates the search bar to /search?q=', async () => {
    const router = await setupRouter()
    render(<RouterProvider router={router} />)
    const input = screen.getAllByPlaceholderText(/Search seeds/i)[0]
    if (input === undefined) throw new Error('search input missing')
    fireEvent.change(input, { target: { value: 'maize seed' } })
    const forms = screen.getAllByRole('search')
    fireEvent.submit(forms[0] as HTMLFormElement)
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/search')
    })
    expect(router.state.location.searchStr).toMatch(/maize/)
  })

  it('badges the cart count from localStorage and hides it when empty', async () => {
    window.localStorage.setItem('farmish-cart', JSON.stringify([{ listingId: 'l1', qty: 2 }]))
    const router = await setupRouter()
    render(<RouterProvider router={router} />)
    expect(await screen.findByTestId('cart-count')).toHaveTextContent('2')
    expect(screen.getByRole('link', { name: 'Cart, 2 items' })).toBeVisible()
  })

  it('lists every category in the mobile menu', async () => {
    const router = await setupRouter()
    render(<RouterProvider router={router} />)
    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }))
    expect(await screen.findByRole('navigation', { name: 'Mobile' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Irrigation Equipment' })).toBeVisible()
  })
})
