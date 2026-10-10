/**
 * Firebase Auth error codes → user-facing copy. Raw SDK messages are never
 * shown: they leak implementation detail and are rarely actionable.
 */

const COPY: Record<string, string> = {
  'auth/invalid-email': 'That email address does not look right.',
  'auth/missing-email': 'Enter your email address.',
  'auth/user-not-found': 'No account found with those details.',
  'auth/wrong-password': 'The password is incorrect.',
  'auth/invalid-credential': 'Those sign-in details are incorrect.',
  'auth/email-already-in-use': 'That email is already registered. Try signing in.',
  'auth/weak-password': 'Choose a password with at least 6 characters.',
  'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
  'auth/network-request-failed': 'Could not reach the server. Check your connection.',
  'auth/popup-closed-by-user': 'The Google sign-in window was closed before finishing.',
  'auth/cancelled-popup-request': 'The Google sign-in window was closed before finishing.',
  'auth/account-exists-with-different-credential':
    'That email is registered with a different sign-in method. Try another one.',
  'auth/invalid-phone-number': 'That phone number does not look right. Use the format 024 123 4567.',
  'auth/missing-phone-number': 'Enter your phone number.',
  'auth/captcha-check-failed': 'The security check failed. Please try again.',
  'auth/invalid-verification-code': 'That code is incorrect. Check the SMS and try again.',
  'auth/code-expired': 'That code expired. Request a new one.',
  'auth/quota-exceeded': 'Too many codes sent. Please wait before requesting another.',
  'auth/requires-recent-login': 'For your security, please sign in again to continue.',
}

const FALLBACK = 'Sign-in failed. Please try again.'

/** Map a Firebase `code` (e.g. `auth/invalid-credential`) to friendly copy. */
export function firebaseErrorMessage(code: unknown): string {
  if (typeof code === 'string' && Object.hasOwn(COPY, code)) {
    const found = COPY[code]
    return found ?? FALLBACK
  }
  return FALLBACK
}
