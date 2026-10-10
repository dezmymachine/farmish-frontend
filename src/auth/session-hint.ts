/**
 * Logged-in hint so guards can redirect instantly. Firebase restores the
 * session asynchronously (IndexedDB read), which forced every logged-out
 * visit to `/account` through a visible "loading…" flash first. Instead:
 * no hint means definitely logged out → redirect on first render; a hint
 * means a session probably exists → wait for the SDK to confirm.
 *
 * The hint is advisory, never authoritative: auth state always comes from
 * Firebase, and a stale hint self-heals (sign-in bounces back to /account
 * once the SDK restores, a dead hint redirects after the check fails).
 */

const KEY = 'farmish:session'

function storage(): Storage | null {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage
  } catch {
    return null
  }
}

/** True when a previous sign-in set the hint and sign-out never cleared it. */
export function hasSessionHint(): boolean {
  return storage()?.getItem(KEY) === '1'
}

/** Record a sign-in. Called from the auth-state listener, not by pages. */
export function setSessionHint(): void {
  try {
    storage()?.setItem(KEY, '1')
  } catch {
    // Private mode etc: the app still works, guards just wait one beat.
  }
}

/** Clear on sign-out (and whenever the SDK reports no user). */
export function clearSessionHint(): void {
  try {
    storage()?.removeItem(KEY)
  } catch {
    // Never break sign-out over storage.
  }
}
