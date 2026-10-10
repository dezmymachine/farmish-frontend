import { queryOptions } from '@tanstack/react-query'
import type { components } from '~/api/schema'
import { getClient, request } from '~/api/client'
import { STALE_TIERS, qk } from '~/api/query-keys'

/*
 * Domain queries for `/v1/categories`. The tree changes only on deploys,
 * so it sits on the reference freshness tier. Consumers fall back to
 * `FALLBACK_CATEGORIES` (lib/categories) when the fetch fails — the
 * navbar must never render an empty Categories menu in CI/offline dev.
 */

export type CategoryNode = components['schemas']['CategoryNode']
export type CategoryList = components['schemas']['CategoryList']

export function categoriesQueryOptions() {
  return queryOptions({
    queryKey: qk.catalog.list({ scope: 'tree' }),
    queryFn: () => request(() => getClient().GET('/v1/categories')),
    staleTime: STALE_TIERS.reference,
  })
}
