const LOCAL_API = 'http://localhost:8080'

/** Base URL of the farmish-backend API. Never hard-code hosts in components. */
export function apiBaseUrl(): string {
  const env = import.meta.env as unknown as Record<string, string | undefined>
  const raw = env['VITE_API_BASE_URL']
  return typeof raw === 'string' && raw.length > 0 ? raw : LOCAL_API
}
