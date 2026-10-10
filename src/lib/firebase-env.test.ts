import { afterEach, describe, expect, it, vi } from 'vitest'
import { appCheckSiteKey, firebaseAuthEmulatorUrl, firebaseWebConfig } from './firebase-env'

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('firebase env', () => {
  it('returns the web config when all four keys are present', () => {
    vi.stubEnv('VITE_FIREBASE_API_KEY', 'k')
    vi.stubEnv('VITE_FIREBASE_AUTH_DOMAIN', 'd')
    vi.stubEnv('VITE_FIREBASE_PROJECT_ID', 'p')
    vi.stubEnv('VITE_FIREBASE_APP_ID', 'a')
    expect(firebaseWebConfig()).toEqual({ apiKey: 'k', authDomain: 'd', projectId: 'p', appId: 'a' })
  })

  it('returns null when any key is missing', () => {
    vi.stubEnv('VITE_FIREBASE_API_KEY', 'k')
    vi.stubEnv('VITE_FIREBASE_AUTH_DOMAIN', 'd')
    vi.stubEnv('VITE_FIREBASE_PROJECT_ID', 'p')
    // Empty counts as missing however the ambient env is set (.env, CI).
    vi.stubEnv('VITE_FIREBASE_APP_ID', '')
    expect(firebaseWebConfig()).toBeNull()
  })

  it('resolves the emulator URL from the flag or an explicit URL', () => {
    // Pin the ambient env: the dev .env may or may not set these.
    vi.stubEnv('VITE_USE_AUTH_EMULATOR', '')
    vi.stubEnv('VITE_FIREBASE_AUTH_EMULATOR_URL', '')
    expect(firebaseAuthEmulatorUrl()).toBeNull()
    vi.stubEnv('VITE_USE_AUTH_EMULATOR', 'true')
    expect(firebaseAuthEmulatorUrl()).toBe('http://127.0.0.1:9099')
    vi.stubEnv('VITE_FIREBASE_AUTH_EMULATOR_URL', 'http://10.0.0.2:9099')
    expect(firebaseAuthEmulatorUrl()).toBe('http://10.0.0.2:9099')
  })

  it('returns the App Check key only when provisioned', () => {
    vi.stubEnv('VITE_FIREBASE_APPCHECK_SITE_KEY', '')
    expect(appCheckSiteKey()).toBeNull()
    vi.stubEnv('VITE_FIREBASE_APPCHECK_SITE_KEY', 'site-key')
    expect(appCheckSiteKey()).toBe('site-key')
  })
})
