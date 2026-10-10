import { afterEach, describe, expect, it } from 'vitest'
import { CART_STORAGE_KEY, getCartCount } from './cart'

afterEach(() => {
  window.localStorage.clear()
})

describe('getCartCount', () => {
  it('is zero when the cart is empty', () => {
    expect(getCartCount()).toBe(0)
  })

  it('sums line quantities', () => {
    window.localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify([
        { listingId: 'l1', qty: 2 },
        { listingId: 'l2', qty: 3 },
      ]),
    )
    expect(getCartCount()).toBe(5)
  })

  it('ignores corrupt or non-numeric lines', () => {
    window.localStorage.setItem(CART_STORAGE_KEY, 'not-json')
    expect(getCartCount()).toBe(0)
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify([{ listingId: 'l1', qty: -2 }]))
    expect(getCartCount()).toBe(0)
  })
})
