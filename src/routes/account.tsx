import * as React from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '~/components/ui/button'
import { RequireAuth } from '~/auth/guards'
import { useAuth } from '~/auth/AuthProvider'
import { meQueryOptions, useUpdateMe } from '~/api/queries/me'
import { friendlyMessage } from '~/lib/errors'
import { formatGhPhone } from '~/lib/phone'

export const Route = createFileRoute('/account')({
  component: AccountPage,
})

const nameSchema = z.object({
  displayName: z.string().trim().min(1, 'Tell us your name.'),
})

type NameFields = z.infer<typeof nameSchema>

function AccountPage() {
  return (
    <RequireAuth>
      <AccountDetail />
    </RequireAuth>
  )
}

function AccountDetail() {
  const { data: me } = useSuspenseQuery(meQueryOptions())
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const updateMe = useUpdateMe()
  const [signOutError, setSignOutError] = React.useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NameFields>({
    resolver: zodResolver(nameSchema),
    defaultValues: { displayName: me.displayName ?? '' },
  })

  const onSubmit = React.useCallback(
    (fields: NameFields) => {
      updateMe.mutate(fields)
    },
    [updateMe],
  )

  const handleSignOut = React.useCallback(async () => {
    setSignOutError(null)
    try {
      await signOut()
      await navigate({ to: '/' })
    } catch (err) {
      setSignOutError(friendlyMessage(err))
    }
  }, [signOut, navigate])

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <h1 className="t-display text-ink">Your account</h1>
      <dl className="mt-6 space-y-3 rounded-xl border border-line bg-paper p-5">
        <div className="flex items-center justify-between gap-4">
          <dt className="t-ui text-ink-faint">Role</dt>
          <dd className="t-ui text-ink">{me.role === 'admin' ? 'Admin' : 'Buyer / seller'}</dd>
        </div>
        {me.email !== undefined && (
          <div className="flex items-center justify-between gap-4">
            <dt className="t-ui text-ink-faint">Email</dt>
            <dd className="t-ui text-ink">
              {me.email} {me.emailVerified ? '(verified)' : '(unverified)'}
            </dd>
          </div>
        )}
        {me.phone !== undefined && (
          <div className="flex items-center justify-between gap-4">
            <dt className="t-ui text-ink-faint">Phone</dt>
            <dd className="t-ui text-ink">{formatGhPhone(me.phone)}</dd>
          </div>
        )}
        <div className="flex items-center justify-between gap-4">
          <dt className="t-ui text-ink-faint">Signed up via</dt>
          <dd className="t-ui text-ink">{me.signupMethod}</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="t-ui text-ink-faint">Seller status</dt>
          <dd className="t-ui text-ink">{me.sellerVerified ? 'Verified seller' : 'Not verified'}</dd>
        </div>
      </dl>

      <section aria-label="Edit display name" className="mt-8">
        <h2 className="t-title text-ink">Display name</h2>
        <form
          className="mt-3 space-y-3"
          onSubmit={(event) => {
            void handleSubmit(onSubmit)(event)
          }}
        >
          <input
            aria-label="Display name"
            type="text"
            autoComplete="name"
            {...register('displayName')}
            className="t-body w-full rounded-lg border border-line bg-paper px-3 py-2 text-ink"
          />
          {errors.displayName !== undefined && (
            <p role="alert" className="t-detail text-negative">
              {errors.displayName.message}
            </p>
          )}
          {updateMe.isError && (
            <p role="alert" className="t-detail text-negative">
              {friendlyMessage(updateMe.error)}
            </p>
          )}
          {updateMe.isSuccess && (
            <p role="status" className="t-detail text-success">
              Saved.
            </p>
          )}
          <Button type="submit" disabled={isSubmitting || updateMe.isPending}>
            {updateMe.isPending ? 'Saving…' : 'Save'}
          </Button>
        </form>
      </section>

      <div className="mt-8">
        <Button
          variant="secondary"
          onClick={() => {
            void handleSignOut()
          }}
        >
          Sign out
        </Button>
        {signOutError !== null && (
          <p role="alert" className="t-detail mt-2 text-negative">
            {signOutError}
          </p>
        )}
      </div>
    </main>
  )
}
