/** Central TanStack Query key factory. Never write a raw array key elsewhere. */

export type QueryParams = Record<
  string,
  string | number | boolean | null | undefined | Array<string | number>
>

function domain<const N extends string>(name: N) {
  const all = [name] as const
  return {
    all,
    list: (params: QueryParams = {}) => [...all, 'list', params] as const,
    detail: (id: string) => [...all, 'detail', id] as const,
  }
}

export const qk = {
  me: {
    all: ['me'] as const,
    current: () => ['me', 'current'] as const,
  },
  catalog: domain('catalog'),
  listings: domain('listings'),
  checkout: domain('checkout'),
  orders: domain('orders'),
  payouts: domain('payouts'),
  engagement: domain('engagement'),
} as const

/** Freshness tiers: pick by how fast the data actually changes. */
export const STALE_TIERS = {
  /** Categories, locations, attributes — change only on deploys. */
  reference: 30 * 60_000,
  /** Listings, seller profiles, reviews — change on user mutation. */
  working: 5 * 60_000,
  /** Orders, payouts, activity — high churn. */
  live: 60_000,
} as const
