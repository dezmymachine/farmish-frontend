import { cn } from '~/lib/utils'

export type HealthStatus = 'ok' | 'down'

/*
 * API health badge for the home page. Rendered from SSR loader data:
 * green dot when the API answers /healthz, grey dot when it does not.
 * The badge asserts presence, never API availability (CI has no backend).
 */
export function HealthBadge({ status, latencyMs }: { status: HealthStatus; latencyMs: number }) {
  const ok = status === 'ok'
  return (
    <p
      data-testid="health-badge"
      role="status"
      className={cn(
        't-ui inline-flex items-center gap-2 rounded-pill border px-4 py-1.5',
        ok ? 'border-success-subtle bg-success-subtle text-success' : 'border-line bg-paper text-ink-faint',
      )}
    >
      <span
        aria-hidden="true"
        className={cn('size-2 rounded-full', ok ? 'bg-success' : 'bg-ink-faint')}
        data-testid={ok ? 'health-dot-ok' : 'health-dot-down'}
      />
      {ok ? `API connected · ${String(latencyMs)} ms` : 'API unreachable — start the backend for live data'}
    </p>
  )
}
