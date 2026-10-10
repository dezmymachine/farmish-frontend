import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type * as React from 'react'
import { resetClient, setTokenProvider } from '~/api/client'
import { qk } from '~/api/query-keys'
import { categoriesQueryOptions } from './catalog'

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
  ],
}

const server = setupServer(http.get('*/v1/categories', () => HttpResponse.json(tree)))

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

describe('catalog queries', () => {
  it('fetches the category tree under the catalog key', async () => {
    const queryClient = new QueryClient()
    const { result } = renderHook(() => useQuery(categoriesQueryOptions()), {
      wrapper: wrapper(queryClient),
    })
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
    expect(result.current.data?.items).toHaveLength(1)
    expect(result.current.data?.items[0]?.children).toHaveLength(1)
    expect(categoriesQueryOptions().queryKey).toEqual(qk.catalog.list({ scope: 'tree' }))
  })
})
