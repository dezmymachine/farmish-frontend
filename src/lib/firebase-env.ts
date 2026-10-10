/**
 * Firebase web-config accessors. All values are public (they ship in the
 * bundle by design) — secrets never live in `VITE_*` vars. Every accessor
 * returns null when unconfigured so SSR, tests and CI stay green without
 * keys; callers render an "unavailable" notice instead of crashing.
 */

export interface FirebaseWebConfig {
  apiKey: string
  authDomain: string
  projectId: string
  appId: string
}

function readEnv(name: string): string | null {
  const env = import.meta.env as unknown as Record<string, string | undefined>
  const raw = env[name]
  return typeof raw === 'string' && raw.length > 0 ? raw : null
}

/** The four Firebase web SDK keys, or null when any is missing. */
export function firebaseWebConfig(): FirebaseWebConfig | null {
  const apiKey = readEnv('VITE_FIREBASE_API_KEY')
  const authDomain = readEnv('VITE_FIREBASE_AUTH_DOMAIN')
  const projectId = readEnv('VITE_FIREBASE_PROJECT_ID')
  const appId = readEnv('VITE_FIREBASE_APP_ID')
  if (apiKey === null || authDomain === null || projectId === null || appId === null) {
    return null
  }
  return { apiKey, authDomain, projectId, appId }
}

/**
 * Auth emulator URL for local dev (`make auth-up` serves 127.0.0.1:9099).
 * Enabled by `VITE_USE_AUTH_EMULATOR=true` (default URL) or an explicit
 * `VITE_FIREBASE_AUTH_EMULATOR_URL`. Null in normal builds.
 */
export function firebaseAuthEmulatorUrl(): string | null {
  const explicit = readEnv('VITE_FIREBASE_AUTH_EMULATOR_URL')
  if (explicit !== null) return explicit
  return readEnv('VITE_USE_AUTH_EMULATOR') === 'true' ? 'http://127.0.0.1:9099' : null
}

/** reCAPTCHA v3 site key for App Check, or null when not provisioned. */
export function appCheckSiteKey(): string | null {
  return readEnv('VITE_FIREBASE_APPCHECK_SITE_KEY')
}
