import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { User } from 'firebase/auth'
import { ReauthDialog } from './ReauthDialog'

function fakeUser(providerId: string | null): User | null {
  if (providerId === null) return null
  return {
    uid: 'uid-1',
    email: 'ama@example.com',
    phoneNumber: '+233241234567',
    providerData: [{ providerId }],
  } as unknown as User
}

function dialog(user: User | null) {
  return <ReauthDialog open user={user} auth={null} onClose={() => {}} onReauthed={() => {}} />
}

describe('ReauthDialog', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <ReauthDialog
        open={false}
        user={fakeUser('password')}
        auth={null}
        onClose={() => {}}
        onReauthed={() => {}}
      />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('asks for the password for email users', () => {
    render(dialog(fakeUser('password')))
    expect(screen.getByRole('dialog')).toBeVisible()
    expect(screen.getByLabelText(/password/i)).toBeVisible()
  })

  it('asks for the phone code for phone users', () => {
    render(dialog(fakeUser('phone')))
    expect(screen.getByLabelText(/phone number/i)).toBeVisible()
  })

  it('offers Google re-auth for Google users', () => {
    render(dialog(fakeUser('google.com')))
    expect(screen.getByRole('button', { name: /verify with google/i })).toBeVisible()
  })

  it('falls back to sign-in-again copy without a user', () => {
    const onClose = vi.fn()
    render(<ReauthDialog open user={null} auth={null} onClose={onClose} onReauthed={() => {}} />)
    expect(screen.getByText(/sign out and sign in again/i)).toBeVisible()
    screen.getByRole('button', { name: /cancel/i }).click()
    expect(onClose).toHaveBeenCalledOnce()
  })
})
