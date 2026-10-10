import type { FirebaseApp } from 'firebase/app'
import { initializeApp, getApps } from 'firebase/app'
import type { Auth } from 'firebase/auth'
import { connectAuthEmulator, getAuth } from 'firebase/auth'
import { appCheckSiteKey, firebaseAuthEmulatorUrl, firebaseWebConfig } from '~/lib/firebase-env'

/*
 * Lazy, SSR-safe Firebase singletons. Nothing here runs at module import:
 * `getFirebaseAuth()` returns null on the server or when the web config is
 * missing, so SSR, unit tests and CI never touch the network. The F2
 * AuthProvider is the only production caller.
 */

let app: FirebaseApp | null = null
let auth: Auth | null = null
let emulatorWired = false
let appCheckWired = false

/**
 * True when all four `VITE_FIREBASE_*` keys are set. Pure env read —
 * identical on server and client so SSR hydrates cleanly. Firebase *init*
 * stays client-only inside `getFirebaseAuth()`.
 */
export function isFirebaseConfigured(): boolean {
  return firebaseWebConfig() !== null
}

/** The shared Firebase Auth instance, or null when unavailable. */
export function getFirebaseAuth(): Auth | null {
  if (typeof window === 'undefined') return null
  const config = firebaseWebConfig()
  if (config === null) return null
  if (auth !== null) return auth
  const existing = getApps()[0]
  app = existing ?? initializeApp(config)
  auth = getAuth(app)
  const emulatorUrl = firebaseAuthEmulatorUrl()
  if (emulatorUrl !== null && !emulatorWired) {
    connectAuthEmulator(auth, emulatorUrl)
    emulatorWired = true
  }
  void initAppCheck(app)
  return auth
}

/**
 * App Check is initialised when a reCAPTCHA v3 site key is provisioned
 * (`VITE_FIREBASE_APPCHECK_SITE_KEY`). Without one it stays off — phone
 * sign-in still works in dev, and enforcement lands once the key exists.
 * Failures never break auth: they fall back to a console warning.
 */
async function initAppCheck(firebaseApp: FirebaseApp): Promise<void> {
  if (appCheckWired || typeof window === 'undefined') return
  const siteKey = appCheckSiteKey()
  if (siteKey === null) return
  appCheckWired = true
  try {
    const { initializeAppCheck, ReCaptchaV3Provider } = await import('firebase/app-check')
    initializeAppCheck(firebaseApp, {
      provider: new ReCaptchaV3Provider(siteKey),
      isTokenAutoRefreshEnabled: true,
    })
  } catch (err) {
    console.warn('App Check init failed; continuing without it.', err)
  }
}

/** Test-only reset for the module singletons. */
export function resetFirebaseForTests(): void {
  app = null
  auth = null
  emulatorWired = false
  appCheckWired = false
}
