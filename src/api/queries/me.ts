import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import type { components } from '~/api/schema'
import { getClient, request } from '~/api/client'
import { STALE_TIERS, qk } from '~/api/query-keys'

/*
 * Domain queries for `/v1/me`. Only consumers of `request()` besides the
 * client itself — components use `meQueryOptions()` / `useUpdateMe()`.
 */

export type Me = components['schemas']['Me']
export type UpdateMeInput = components['schemas']['UpdateMeRequest']

/** The signed-in user's account. First call after sign-in creates it. */
export function meQueryOptions() {
  return queryOptions({
    queryKey: qk.me.current(),
    queryFn: () => request(() => getClient().GET('/v1/me')),
    staleTime: STALE_TIERS.working,
  })
}

/**
 * PATCH /v1/me. Only `displayName` is editable here — email and phone are
 * managed through Firebase. Patches the cache surgically, then invalidates
 * broadly so role/seller flags converge.
 */
export function useUpdateMe() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateMeInput) => request(() => getClient().PATCH('/v1/me', { body: input })),
    onSuccess: (me) => {
      queryClient.setQueryData(qk.me.current(), me)
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: qk.me.all })
    },
  })
}
