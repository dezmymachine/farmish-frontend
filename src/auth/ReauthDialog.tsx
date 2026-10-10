import * as React from 'react'
import type { Auth, ConfirmationResult, RecaptchaVerifier, User } from 'firebase/auth'
import {
  EmailAuthProvider,
  GoogleAuthProvider,
  reauthenticateWithCredential,
  reauthenticateWithPhoneNumber,
  reauthenticateWithPopup,
} from 'firebase/auth'
import { Button } from '~/components/ui/button'
import { normalizeGhPhone } from '~/lib/phone'
import { firebaseErrorMessage } from './errors'

/*
 * Step-up re-auth dialog, opened by the query client's global net on
 * `reauth_required` (fresh sign-in needed for sensitive writes). The method
 * follows the user's original provider: phone users reconfirm by SMS
 * (`reauthenticateWithPhoneNumber`), everyone else by their own provider.
 * Props-driven so it renders in tests without a Firebase session.
 */

type Method = 'phone' | 'password' | 'google' | 'generic'

function methodFor(user: User | null): Method {
  const ids = user?.providerData.map((info) => info.providerId) ?? []
  if (ids.includes('phone')) return 'phone'
  if (ids.includes('password')) return 'password'
  if (ids.includes('google.com')) return 'google'
  return 'generic'
}

interface ReauthDialogProps {
  open: boolean
  user: User | null
  auth: Auth | null
  onClose: () => void
  onReauthed: () => void
}

export function ReauthDialog({ open, user, auth, onClose, onReauthed }: ReauthDialogProps) {
  const method = methodFor(user)
  if (!open) return null
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reauth-title"
      className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4"
    >
      <div className="w-full max-w-md rounded-xl border border-line bg-paper p-6 shadow-elevated">
        <h2 id="reauth-title" className="t-title text-ink">
          Verify it&rsquo;s you
        </h2>
        <p className="t-detail mt-1 text-ink-faint">For your security, confirm your sign-in to continue.</p>
        <div className="mt-4">
          {method === 'phone' ? (
            <PhoneReauth user={user} auth={auth} onReauthed={onReauthed} />
          ) : method === 'password' ? (
            <PasswordReauth user={user} onReauthed={onReauthed} />
          ) : method === 'google' ? (
            <GoogleReauth user={user} onReauthed={onReauthed} />
          ) : (
            <p className="t-body text-ink-soft">Please sign out and sign in again to continue.</p>
          )}
        </div>
        <div id="reauth-recaptcha" aria-hidden="true" />
        <div className="mt-4 flex justify-end">
          <Button variant="quiet" size="S" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}

function useRecaptcha(auth: Auth | null): () => Promise<RecaptchaVerifier | null> {
  const verifierRef = React.useRef<RecaptchaVerifier | null>(null)
  React.useEffect(
    () => () => {
      verifierRef.current?.clear()
      verifierRef.current = null
    },
    [],
  )
  return React.useCallback(async () => {
    if (auth === null || typeof window === 'undefined') return null
    if (verifierRef.current !== null) return verifierRef.current
    const { RecaptchaVerifier: Verifier } = await import('firebase/auth')
    verifierRef.current = new Verifier(auth, 'reauth-recaptcha', { size: 'invisible' })
    return verifierRef.current
  }, [auth])
}

function ErrorNote({ message }: { message: string | null }) {
  if (message === null) return null
  return (
    <p role="alert" className="t-detail mt-3 text-negative">
      {message}
    </p>
  )
}

function PhoneReauth({
  user,
  auth,
  onReauthed,
}: {
  user: User | null
  auth: Auth | null
  onReauthed: () => void
}) {
  const ensureRecaptcha = useRecaptcha(auth)
  const [phone, setPhone] = React.useState(user?.phoneNumber ?? '')
  const [code, setCode] = React.useState('')
  const [confirmation, setConfirmation] = React.useState<ConfirmationResult | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [busy, setBusy] = React.useState(false)

  const sendCode = React.useCallback(async () => {
    if (user === null) return
    const e164 = normalizeGhPhone(phone)
    if (e164 === null) {
      setError('That phone number does not look right. Use the format 024 123 4567.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const verifier = await ensureRecaptcha()
      if (verifier === null) throw new Error('recaptcha unavailable')
      setConfirmation(await reauthenticateWithPhoneNumber(user, e164, verifier))
    } catch (err) {
      setError(firebaseErrorMessage((err as { code?: unknown }).code))
    } finally {
      setBusy(false)
    }
  }, [user, phone, ensureRecaptcha])

  const confirmCode = React.useCallback(async () => {
    if (confirmation === null) return
    setBusy(true)
    setError(null)
    try {
      await confirmation.confirm(code.trim())
      onReauthed()
    } catch (err) {
      setError(firebaseErrorMessage((err as { code?: unknown }).code))
    } finally {
      setBusy(false)
    }
  }, [confirmation, code, onReauthed])

  return (
    <div>
      {confirmation === null ? (
        <>
          <label htmlFor="reauth-phone" className="t-ui text-ink-soft">
            Phone number
          </label>
          <input
            id="reauth-phone"
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(event) => {
              setPhone(event.target.value)
            }}
            className="t-body mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-ink"
          />
          <Button
            className="mt-3"
            disabled={busy}
            onClick={() => {
              void sendCode()
            }}
          >
            {busy ? 'Sending…' : 'Send code'}
          </Button>
        </>
      ) : (
        <>
          <label htmlFor="reauth-code" className="t-ui text-ink-soft">
            SMS code
          </label>
          <input
            id="reauth-code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={(event) => {
              setCode(event.target.value)
            }}
            className="t-body mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-ink"
          />
          <Button
            className="mt-3"
            disabled={busy}
            onClick={() => {
              void confirmCode()
            }}
          >
            {busy ? 'Verifying…' : 'Verify'}
          </Button>
        </>
      )}
      <ErrorNote message={error} />
    </div>
  )
}

function PasswordReauth({ user, onReauthed }: { user: User | null; onReauthed: () => void }) {
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const [busy, setBusy] = React.useState(false)

  const reconfirm = React.useCallback(async () => {
    if (user?.email === null || user?.email === undefined) {
      setError('No email on this account. Sign in again instead.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, password))
      onReauthed()
    } catch (err) {
      setError(firebaseErrorMessage((err as { code?: unknown }).code))
    } finally {
      setBusy(false)
    }
  }, [user, password, onReauthed])

  return (
    <div>
      <label htmlFor="reauth-password" className="t-ui text-ink-soft">
        Password for {user?.email ?? 'your account'}
      </label>
      <input
        id="reauth-password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(event) => {
          setPassword(event.target.value)
        }}
        className="t-body mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-ink"
      />
      <Button
        className="mt-3"
        disabled={busy || password.length === 0}
        onClick={() => {
          void reconfirm()
        }}
      >
        {busy ? 'Verifying…' : 'Verify'}
      </Button>
      <ErrorNote message={error} />
    </div>
  )
}

function GoogleReauth({ user, onReauthed }: { user: User | null; onReauthed: () => void }) {
  const [error, setError] = React.useState<string | null>(null)
  const [busy, setBusy] = React.useState(false)

  const reconfirm = React.useCallback(async () => {
    if (user === null) return
    setBusy(true)
    setError(null)
    try {
      await reauthenticateWithPopup(user, new GoogleAuthProvider())
      onReauthed()
    } catch (err) {
      setError(firebaseErrorMessage((err as { code?: unknown }).code))
    } finally {
      setBusy(false)
    }
  }, [user, onReauthed])

  return (
    <div>
      <Button
        disabled={busy}
        onClick={() => {
          void reconfirm()
        }}
      >
        {busy ? 'Verifying…' : 'Verify with Google'}
      </Button>
      <ErrorNote message={error} />
    </div>
  )
}
