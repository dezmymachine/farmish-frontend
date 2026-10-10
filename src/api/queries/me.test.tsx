import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type * as React from 'react'
import { resetClient, setTokenProvider } from '~/api/client'
import { qk } from '~/api/query-keys'
import { meQueryOptions, useUpdateMe, type Me } from './me'

const stored: Me = {
  id: 'u1',
  email: 'ama@example.com',
  emailVerified: true,
  displayName: 'Ama',
  signupMethod: 'email',
  role: 'user',
  sellerVerified: false,
  createdAt: new Date(0).toISOString(),
  updatedAt: new Date(0).toISOString(),
}

const server = setupServer(
  http.get('*/v1/me', () => HttpResponse.json(stored)),
  http.patch('*/v1/me', () => HttpResponse.json({ ...stored, displayName: 'Ama Serwaa' })),
)

beforeAll(() => {
  server.listen({ onUnhandledFrame: 'error' })
})
afterEach(() => {
  server.resetHandlers()
  resetClient()
  setTokenProvider(() => Promise.resolve(null))
})
afterAll(() => {
  server.close()
})

function wrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('me queries', () => {
  it('fetches the signed-in account under the me key', async () => {
    const queryClient = new QueryClient()
    const { result } = renderHook(() => useQuery(meQueryOptions()), { wrapper: wrapper(queryClient) })
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
    expect(result.current.data).toMatchObject({ id: 'u1', displayName: 'Ama' })
    expect(meQueryOptions().queryKey).toEqual(qk.me.current())
  })

  it('patches displayName and updates the cached account', async () => {
    const queryClient = new QueryClient()
    queryClient.setQueryData(qk.me.current(), stored)
    const { result } = renderHook(() => useUpdateMe(), { wrapper: wrapper(queryClient) })
    result.current.mutate({ displayName: 'Ama Serwaa' })
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
    expect(queryClient.getQueryData(qk.me.current())).toMatchObject({ displayName: 'Ama Serwaa' })
  })
})
