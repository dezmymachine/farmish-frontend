import { createFileRoute } from '@tanstack/react-router'
import { Sprout } from 'lucide-react'
import { HealthBadge, type HealthStatus } from '~/components/HealthBadge'
import { Button } from '~/components/ui/button'
import { apiBaseUrl } from '~/lib/env'

export const Route = createFileRoute('/')({
  loader: async () => ({ health: await checkApiHealth() }),
  component: Home,
})

async function checkApiHealth(): Promise<{ status: HealthStatus; latencyMs: number }> {
  const started = Date.now()
  try {
    const res = await fetch(`${apiBaseUrl()}/healthz`, { signal: AbortSignal.timeout(3000) })
    return { status: res.ok ? 'ok' : 'down', latencyMs: Date.now() - started }
  } catch {
    return { status: 'down', latencyMs: Date.now() - started }
  }
}

function Home() {
  const { health } = Route.useLoaderData()
  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <HealthBadge status={health.status} latencyMs={health.latencyMs} />
      <h1 className="t-display mt-8 max-w-2xl text-ink">Ghana&apos;s agricultural marketplace</h1>
      <p className="t-body-lg mt-4 max-w-xl text-ink-soft">
        Seeds, fertilizers, machinery, livestock, feeds and fresh produce — bought from verified sellers, paid
        securely through escrow.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button size="L">Browse the market</Button>
        <Button size="L" variant="secondary">
          Start selling
        </Button>
      </div>
      <section aria-label="Marketplace categories" className="mt-12 grid gap-4 sm:grid-cols-3">
        {['Crops & seeds', 'Livestock & feeds', 'Machinery & inputs'].map((title) => (
          <article key={title} className="rounded-xl border border-line bg-paper p-5 shadow-elevated">
            <Sprout className="size-5 text-accent" aria-hidden="true" />
            <h2 className="t-title mt-3 text-ink">{title}</h2>
            <p className="t-detail mt-1 text-ink-faint">Full browsing lands in phase F3.</p>
          </article>
        ))}
      </section>
    </main>
  )
}
