import * as React from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import type { ConfirmationResult, RecaptchaVerifier } from 'firebase/auth'
import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signInWithPopup,
} from 'firebase/auth'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '~/components/ui/button'
import { normalizeGhPhone } from '~/lib/phone'
import { useAuth } from '~/auth/AuthProvider'
import { firebaseErrorMessage } from '~/auth/errors'
import { getFirebaseAuth } from '~/auth/firebase'
import { friendlyMessage } from '~/lib/errors'

export const Route = createFileRoute('/sign-in')({
  component: SignInPage,
})

const emailSchema = z.object({
  email: z.email('That email address does not look right.'),
  password: z.string().min(1, 'Enter your password.'),
})

const phoneSchema = z.object({
  phone: z.string().min(1, 'Enter your phone number.'),
})

type EmailFields = z.infer<typeof emailSchema>
type PhoneFields = z.infer<typeof phoneSchema>

function SignInPage() {
  const { user, initializing, isConfigured } = useAuth()
  const navigate = useNavigate()

  React.useEffect(() => {
    if (!initializing && user !== null) {
      void navigate({ to: '/account' })
    }
  }, [initializing, user, navigate])

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <h1 className="t-display text-ink">Sign in to Farmish</h1>
      <p className="t-body-lg mt-2 text-ink-soft">
        Buy and sell across Ghana&rsquo;s agricultural marketplace.
      </p>
      {!isConfigured ? (
        <p role="status" className="t-body mt-6 rounded-lg border border-line bg-wash p-4 text-ink-soft">
          Sign-in is unavailable until the Firebase web config is set. Copy `.env.example` to `.env` and fill
          in the `VITE_FIREBASE_*` values.
        </p>
      ) : (
        <div className="mt-6 space-y-8">
          <GoogleSection />
          <EmailSection />
          <PhoneSection />
        </div>
      )}
      <p className="t-body mt-8 text-ink-soft">
        New here?{' '}
        <Link to="/sign-up" className="text-accent underline">
          Create an account
        </Link>
      </p>
    </main>
  )
}

function AuthError({ message }: { message: string | null }) {
  if (message === null) return null
  return (
    <p role="alert" className="t-detail mt-2 text-negative">
      {message}
    </p>
  )
}

function GoogleSection() {
  const navigate = useNavigate()
  const { refreshUser } = useAuth()
  const [error, setError] = React.useState<string | null>(null)
  const [busy, setBusy] = React.useState(false)

  const signIn = React.useCallback(async () => {
    const auth = getFirebaseAuth()
    if (auth === null) return
    setBusy(true)
    setError(null)
    try {
      await signInWithPopup(auth, new GoogleAuthProvider())
      refreshUser()
      await navigate({ to: '/account' })
    } catch (err) {
      setError(firebaseErrorMessage((err as { code?: unknown }).code))
    } finally {
      setBusy(false)
    }
  }, [navigate, refreshUser])

  return (
    <section aria-label="Continue with Google">
      <Button
        variant="secondary"
        size="L"
        className="w-full"
        disabled={busy}
        onClick={() => {
          void signIn()
        }}
      >
        {busy ? 'Opening Google…' : 'Continue with Google'}
      </Button>
      <AuthError message={error} />
    </section>
  )
}

function EmailSection() {
  const navigate = useNavigate()
  const { refreshUser } = useAuth()
  const [error, setError] = React.useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EmailFields>({ resolver: zodResolver(emailSchema) })

  const onSubmit = React.useCallback(
    async (fields: EmailFields) => {
      const auth = getFirebaseAuth()
      if (auth === null) return
      setError(null)
      try {
        await signInWithEmailAndPassword(auth, fields.email, fields.password)
        refreshUser()
        await navigate({ to: '/account' })
      } catch (err) {
        const fb = err as { code?: unknown; message?: string }
        setError(fb.code !== undefined ? firebaseErrorMessage(fb.code) : friendlyMessage(err))
      }
    },
    [navigate, refreshUser],
  )

  return (
    <section aria-label="Sign in with email">
      <h2 className="t-title text-ink">Email and password</h2>
      <form
        className="mt-3 space-y-3"
        onSubmit={(event) => {
          void handleSubmit(onSubmit)(event)
        }}
      >
        <div>
          <label htmlFor="signin-email" className="t-ui text-ink-soft">
            Email
          </label>
          <input
            id="signin-email"
            type="email"
            autoComplete="email"
            {...register('email')}
            className="t-body mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-ink"
          />
          {errors.email !== undefined && (
            <p role="alert" className="t-detail mt-1 text-negative">
              {errors.email.message}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="signin-password" className="t-ui text-ink-soft">
            Password
          </label>
          <input
            id="signin-password"
            type="password"
            autoComplete="current-password"
            {...register('password')}
            className="t-body mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-ink"
          />
          {errors.password !== undefined && (
            <p role="alert" className="t-detail mt-1 text-negative">
              {errors.password.message}
            </p>
          )}
        </div>
        <Button type="submit" size="L" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
      <AuthError message={error} />
    </section>
  )
}

function PhoneSection() {
  const navigate = useNavigate()
  const { refreshUser } = useAuth()
  const [error, setError] = React.useState<string | null>(null)
  const [busy, setBusy] = React.useState(false)
  const [confirmation, setConfirmation] = React.useState<ConfirmationResult | null>(null)
  const [code, setCode] = React.useState('')
  const verifierRef = React.useRef<RecaptchaVerifier | null>(null)

  React.useEffect(
    () => () => {
      verifierRef.current?.clear()
      verifierRef.current = null
    },
    [],
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PhoneFields>({ resolver: zodResolver(phoneSchema) })

  const sendCode = React.useCallback(async (fields: PhoneFields) => {
    const auth = getFirebaseAuth()
    if (auth === null) return
    const e164 = normalizeGhPhone(fields.phone)
    if (e164 === null) {
      setError('That phone number does not look right. Use the format 024 123 4567.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      let verifier = verifierRef.current
      if (verifier === null) {
        const { RecaptchaVerifier: Verifier } = await import('firebase/auth')
        verifier = new Verifier(auth, 'signin-recaptcha', { size: 'invisible' })
        verifierRef.current = verifier
      }
      setConfirmation(await signInWithPhoneNumber(auth, e164, verifier))
    } catch (err) {
      setError(firebaseErrorMessage((err as { code?: unknown }).code))
    } finally {
      setBusy(false)
    }
  }, [])

  const confirmCode = React.useCallback(async () => {
    if (confirmation === null) return
    setBusy(true)
    setError(null)
    try {
      await confirmation.confirm(code.trim())
      refreshUser()
      await navigate({ to: '/account' })
    } catch (err) {
      setError(firebaseErrorMessage((err as { code?: unknown }).code))
    } finally {
      setBusy(false)
    }
  }, [confirmation, code, navigate, refreshUser])

  return (
    <section aria-label="Sign in with phone">
      <h2 className="t-title text-ink">Phone number</h2>
      {confirmation === null ? (
        <form
          className="mt-3 space-y-3"
          onSubmit={(event) => {
            void handleSubmit(sendCode)(event)
          }}
        >
          <div>
            <label htmlFor="signin-phone" className="t-ui text-ink-soft">
              Phone (024 123 4567)
            </label>
            <input
              id="signin-phone"
              type="tel"
              autoComplete="tel"
              placeholder="024 123 4567"
              {...register('phone')}
              className="t-body mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-ink"
            />
            {errors.phone !== undefined && (
              <p role="alert" className="t-detail mt-1 text-negative">
                {errors.phone.message}
              </p>
            )}
          </div>
          <Button type="submit" size="L" variant="secondary" className="w-full" disabled={busy}>
            {busy ? 'Sending code…' : 'Send SMS code'}
          </Button>
        </form>
      ) : (
        <div className="mt-3 space-y-3">
          <div>
            <label htmlFor="signin-code" className="t-ui text-ink-soft">
              SMS code
            </label>
            <input
              id="signin-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(event) => {
                setCode(event.target.value)
              }}
              className="t-body mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-ink"
            />
          </div>
          <Button
            size="L"
            className="w-full"
            disabled={busy}
            onClick={() => {
              void confirmCode()
            }}
          >
            {busy ? 'Verifying…' : 'Verify code'}
          </Button>
        </div>
      )}
      <div id="signin-recaptcha" aria-hidden="true" />
      <AuthError message={error} />
    </section>
  )
}
