import { Link, createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

/*
 * Market search landing (F3 builds the real browse here). For the navbar
 * slice it echoes the query so SearchBar navigation and category links
 * land somewhere real instead of a 404.
 */
const searchParams = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
})

export const Route = createFileRoute('/search')({
  validateSearch: (search) => searchParams.parse(search),
  component: SearchPage,
})

function SearchPage() {
  const { q, category } = Route.useSearch()
  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="t-title-lg text-ink">Market</h1>
      <p className="t-body mt-2 text-ink-soft" role="status">
        {q !== undefined && q !== ''
          ? `Results for “${q}” land in phase F3.`
          : category !== undefined && category !== ''
            ? `Browsing “${category}” lands in phase F3.`
            : 'Search and filters land in phase F3.'}
      </p>
      <p className="t-body mt-4">
        <Link to="/" className="text-accent underline">
          Back home
        </Link>
      </p>
    </main>
  )
}
