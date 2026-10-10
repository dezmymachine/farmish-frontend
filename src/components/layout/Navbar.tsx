import * as React from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
  Menu01Icon,
  Search01Icon,
  ShoppingCart01Icon,
  SproutIcon,
  Store01Icon,
  UserCircle02Icon,
} from '@hugeicons/core-free-icons'
import { useAuth } from '~/auth/AuthProvider'
import { categoriesQueryOptions } from '~/api/queries/catalog'
import { FALLBACK_CATEGORIES, categorySearchTo, textSearchTo, type CategoryParent } from '~/lib/categories'
import { getCartCount } from '~/lib/cart'
import { cn } from '~/lib/utils'
import { Button } from '~/components/ui/button'
import { Icon } from '~/components/ui/icon'
import { Input } from '~/components/ui/input'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '~/components/ui/navigation-menu'

/*
 * Site navbar: logo left, nav + search middle, cart + auth right.
 * - Home / Market are direct links; Categories opens a shadcn
 *   NavigationMenu on hover *and* keyboard focus (Radix behaviour).
 * - The live category tree comes from GET /v1/categories; the static
 *   DOMAIN §9 fallback keeps the menu populated offline / in CI.
 * - Signed-out visitors get an accent "Sign in" button; signed-in users
 *   get a profile icon button to /account. Cart sits before auth.
 */

export function Navbar() {
  const [mobileOpen, setMobileOpen] = React.useState(false)
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3">
        <Logo />
        <DesktopNav />
        <SearchBar className="hidden min-w-0 flex-1 md:flex" />
        <div className="ml-auto flex items-center gap-2">
          <CartButton />
          <AuthControl />
          <button
            type="button"
            className="t-ui grid size-10 place-items-center rounded-lg text-ink-soft hover:bg-wash hover:text-ink md:hidden"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            onClick={() => {
              setMobileOpen((open) => !open)
            }}
          >
            <Icon icon={Menu01Icon} size={22} />
          </button>
        </div>
        <SearchBar className="w-full md:hidden" />
      </div>
      {mobileOpen && (
        <MobileNav
          onNavigate={() => {
            setMobileOpen(false)
          }}
        />
      )}
    </header>
  )
}

function Logo() {
  return (
    <Link to="/" className="flex shrink-0 items-center gap-2" aria-label="Farmish home">
      <span className="grid size-9 place-items-center rounded-pill bg-accent text-on-accent">
        <Icon icon={SproutIcon} size={20} />
      </span>
      <span className="t-title text-ink">Farmish</span>
    </Link>
  )
}

function useMenuCategories(): Array<CategoryParent> {
  const query = useQuery(categoriesQueryOptions())
  if (query.data !== undefined) {
    return query.data.items.map((node) => ({
      name: node.name,
      slug: node.slug,
      children: node.children.map((kid) => ({ name: kid.name, slug: kid.slug })),
    }))
  }
  return FALLBACK_CATEGORIES
}

function DesktopNav() {
  const categories = useMenuCategories()
  return (
    <NavigationMenu className="hidden md:flex" aria-label="Primary">
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), 'no-underline')}>
            <Link to="/" activeOptions={{ exact: true }} activeProps={{ className: 'text-ink bg-wash' }}>
              Home
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), 'no-underline')}>
            <Link to="/search" activeProps={{ className: 'text-ink bg-wash' }}>
              <span className="inline-flex items-center gap-1.5">
                <Icon icon={Store01Icon} size={16} />
                Market
              </span>
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Categories</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid w-[min(52rem,90vw)] gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((cat) => (
                <div key={cat.slug}>
                  <NavigationMenuLink
                    asChild
                    className="t-ui rounded-md text-ink hover:text-accent hover:underline"
                  >
                    <Link {...categorySearchTo(cat.slug)}>{cat.name}</Link>
                  </NavigationMenuLink>
                  {cat.children.length > 0 && (
                    <ul className="mt-1.5 space-y-1">
                      {cat.children.slice(0, 5).map((kid) => (
                        <li key={kid.slug}>
                          <NavigationMenuLink
                            asChild
                            className="t-detail rounded-md text-ink-faint hover:text-ink hover:underline"
                          >
                            <Link {...categorySearchTo(kid.slug)}>{kid.name}</Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 border-t border-line pt-3">
              <NavigationMenuLink asChild className="t-ui rounded-md text-accent hover:underline">
                <Link to="/search">Browse the full market →</Link>
              </NavigationMenuLink>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

function SearchBar({ className }: { className?: string }) {
  const navigate = useNavigate()
  const [value, setValue] = React.useState('')
  // Two SearchBars mount at once (desktop + mobile breakpoints): a unique
  // id per instance keeps the label/input association valid.
  const searchId = React.useId()
  return (
    <form
      role="search"
      aria-label="Search the market"
      className={cn('min-w-0 items-center', className)}
      onSubmit={(event) => {
        event.preventDefault()
        const dest = textSearchTo(value)
        void navigate(dest)
      }}
    >
      <label htmlFor={searchId} className="sr-only">
        Search listings
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-faint">
          <Icon icon={Search01Icon} size={18} />
        </span>
        <Input
          id={searchId}
          name="q"
          type="search"
          autoComplete="off"
          placeholder="Search seeds, machinery, livestock…"
          value={value}
          onChange={(event) => {
            setValue(event.target.value)
          }}
          className="pl-10"
        />
      </div>
    </form>
  )
}

function CartButton() {
  const [count, setCount] = React.useState(getCartCount)
  React.useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === 'farmish-cart') setCount(getCartCount())
    }
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener('storage', onStorage)
    }
  }, [])
  return (
    <Link
      to="/cart"
      aria-label={count > 0 ? `Cart, ${String(count)} items` : 'Cart, empty'}
      className="t-ui relative grid size-10 place-items-center rounded-pill text-ink-soft transition-colors hover:bg-wash hover:text-ink"
      activeProps={{ className: 'text-ink bg-wash' }}
    >
      <Icon icon={ShoppingCart01Icon} size={22} />
      {count > 0 && (
        <span
          data-testid="cart-count"
          className="t-detail absolute -top-0.5 -right-0.5 grid h-5 min-w-5 place-items-center rounded-pill bg-accent px-1 font-bold text-on-accent"
        >
          {count > 99 ? '99+' : String(count)}
        </span>
      )}
    </Link>
  )
}

function AuthControl() {
  const { user, initializing } = useAuth()
  if (!initializing && user !== null) {
    return (
      <Link
        to="/account"
        aria-label="Your account"
        className="grid size-10 place-items-center rounded-pill text-ink-soft transition-colors hover:bg-wash hover:text-ink"
        activeProps={{ className: 'text-ink bg-wash' }}
      >
        <Icon icon={UserCircle02Icon} size={24} />
      </Link>
    )
  }
  return (
    <Button size="S" asChild>
      <Link to="/sign-in">Sign in</Link>
    </Button>
  )
}

function MobileNav({ onNavigate }: { onNavigate: () => void }) {
  const categories = useMenuCategories()
  return (
    <nav id="mobile-nav" aria-label="Mobile" className="border-t border-line bg-paper md:hidden">
      <ul className="t-ui mx-auto max-w-6xl space-y-1 px-4 py-3">
        <li>
          <Link
            to="/"
            activeOptions={{ exact: true }}
            className="block rounded-lg px-3 py-2 text-ink-soft hover:bg-wash hover:text-ink"
            onClick={onNavigate}
          >
            Home
          </Link>
        </li>
        <li>
          <Link
            to="/search"
            className="block rounded-lg px-3 py-2 text-ink-soft hover:bg-wash hover:text-ink"
            onClick={onNavigate}
          >
            Market
          </Link>
        </li>
        <li className="pt-2">
          <p className="t-detail px-3 text-ink-faint">Categories</p>
          <ul className="mt-1 grid gap-0.5">
            {categories.map((cat) => (
              <li key={cat.slug}>
                <Link
                  {...categorySearchTo(cat.slug)}
                  className="block rounded-lg px-3 py-2 text-ink-soft hover:bg-wash hover:text-ink"
                  onClick={onNavigate}
                >
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </li>
      </ul>
    </nav>
  )
}
