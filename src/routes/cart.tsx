import { Link, createFileRoute } from '@tanstack/react-router'

/*
 * Cart placeholder (F5 builds the real cart here). The navbar links here
 * so the cart icon is never a dead end.
 */
export const Route = createFileRoute('/cart')({
  component: CartPage,
})

function CartPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="t-title-lg text-ink">Your cart</h1>
      <p className="t-body mt-2 text-ink-soft" role="status">
        Your cart is empty. The full cart lands in phase F5.
      </p>
      <p className="t-body mt-4">
        <Link to="/search" className="text-accent underline">
          Browse the market
        </Link>
      </p>
    </main>
  )
}
