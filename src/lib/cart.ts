/*
 * Local cart helpers (F5 owns the full cart; the navbar only needs the
 * count badge). Lines live in localStorage under `farmish-cart` as
 * `{ listingId, qty }[]`. Everything is defensive: SSR-safe, tolerant of
 * corrupt JSON, and badge-hidden when empty.
 */

export const CART_STORAGE_KEY = 'farmish-cart'

export interface CartLine {
  listingId: string
  qty: number
}

export function getCartCount(): number {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') return 0
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY)
    if (raw === null) return 0
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return 0
    return parsed.reduce<number>((sum, line) => {
      if (typeof line === 'object' && line !== null && 'qty' in line) {
        const qty = (line as { qty: unknown }).qty
        return sum + (typeof qty === 'number' && Number.isFinite(qty) && qty > 0 ? Math.floor(qty) : 0)
      }
      return sum
    }, 0)
  } catch {
    return 0
  }
}
