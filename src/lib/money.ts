import type { components } from '~/api/schema'

export type Money = components['schemas']['Money']

const ghs = new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' })

/**
 * Display-only money formatting. `amount` is integer pesewas; the API owns
 * all arithmetic — the UI never adds, subtracts or totals Money values.
 */
export function formatMoney(m: Money): string {
  return ghs.format(m.amount / 100)
}
