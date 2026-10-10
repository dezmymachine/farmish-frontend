import * as React from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '~/components/ui/button'
import { useAuth } from '~/auth/AuthProvider'
import { firebaseErrorMessage } from '~/auth/errors'
import { getFirebaseAuth } from '~/auth/firebase'

export const Route = createFileRoute('/sign-up')({
  component: SignUpPage,
})

const signUpSchema = z.object({
  displayName: z.string().trim().min(1, 'Tell us your name.'),
  email: z.email('That email address does not look right.'),
  password: z.string().min(6, 'Choose a password with at least 6 characters.'),
})

type SignUpFields = z.infer<typeof signUpSchema>

function SignUpPage() {
  const { user, initializing, isConfigured } = useAuth()
  const navigate = useNavigate()

  React.useEffect(() => {
    if (!initializing && user !== null) {
      void navigate({ to: '/account' })
    }
  }, [initializing, user, navigate])

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <h1 className="t-display text-ink">Join Farmish</h1>
      <p className="t-body-lg mt-2 text-ink-soft">
        One account for buying and selling. Phone users can sign in directly — no separate registration
        needed.
      </p>
      {!isConfigured ? (
        <p role="status" className="t-body mt-6 rounded-lg border border-line bg-wash p-4 text-ink-soft">
          Sign-up is unavailable until the Firebase web config is set. Copy `.env.example` to `.env` and fill
          in the `VITE_FIREBASE_*` values.
        </p>
      ) : (
        <div className="mt-6 space-y-8">
          <GoogleSection />
          <EmailSection />
        </div>
      )}
      <p className="t-body mt-8 text-ink-soft">
        Already have an account?{' '}
        <Link to="/sign-in" className="text-accent underline">
          Sign in
        </Link>
      </p>
    </main>
  )
}

function GoogleSection() {
  const navigate = useNavigate()
  const [error, setError] = React.useState<string | null>(null)
  const [busy, setBusy] = React.useState(false)

  const signUp = React.useCallback(async () => {
    const auth = getFirebaseAuth()
    if (auth === null) return
    setBusy(true)
    setError(null)
    try {
      await signInWithPopup(auth, new GoogleAuthProvider())
      await navigate({ to: '/account' })
    } catch (err) {
      setError(firebaseErrorMessage((err as { code?: unknown }).code))
    } finally {
      setBusy(false)
    }
  }, [navigate])

  return (
    <section aria-label="Continue with Google">
      <Button
        variant="secondary"
        size="L"
        className="w-full"
        disabled={busy}
        onClick={() => {
          void signUp()
        }}
      >
        {busy ? 'Opening Google…' : 'Continue with Google'}
      </Button>
      {error !== null && (
        <p role="alert" className="t-detail mt-2 text-negative">
          {error}
        </p>
      )}
    </section>
  )
}

function EmailSection() {
  const navigate = useNavigate()
  const [error, setError] = React.useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFields>({ resolver: zodResolver(signUpSchema) })

  const onSubmit = React.useCallback(
    async (fields: SignUpFields) => {
      const auth = getFirebaseAuth()
      if (auth === null) return
      setError(null)
      try {
        const credential = await createUserWithEmailAndPassword(auth, fields.email, fields.password)
        await updateProfile(credential.user, { displayName: fields.displayName })
        await navigate({ to: '/account' })
      } catch (err) {
        setError(firebaseErrorMessage((err as { code?: unknown }).code))
      }
    },
    [navigate],
  )

  return (
    <section aria-label="Sign up with email">
      <h2 className="t-title text-ink">Email and password</h2>
      <form
        className="mt-3 space-y-3"
        onSubmit={(event) => {
          void handleSubmit(onSubmit)(event)
        }}
      >
        <div>
          <label htmlFor="signup-name" className="t-ui text-ink-soft">
            Your name
          </label>
          <input
            id="signup-name"
            type="text"
            autoComplete="name"
            {...register('displayName')}
            className="t-body mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-ink"
          />
          {errors.displayName !== undefined && (
            <p role="alert" className="t-detail mt-1 text-negative">
              {errors.displayName.message}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="signup-email" className="t-ui text-ink-soft">
            Email
          </label>
          <input
            id="signup-email"
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
          <label htmlFor="signup-password" className="t-ui text-ink-soft">
            Password
          </label>
          <input
            id="signup-password"
            type="password"
            autoComplete="new-password"
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
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
      {error !== null && (
        <p role="alert" className="t-detail mt-2 text-negative">
          {error}
        </p>
      )}
    </section>
  )
}
