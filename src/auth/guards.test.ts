import { describe, expect, it } from 'vitest'
import { adminRedirect, signInRedirect } from './guards'

describe('sign-in guard', () => {
  it('redirects logged-out visitors once auth settles', () => {
    expect(signInRedirect({ initializing: false, userUid: null })).toBe('/sign-in')
  })

  it('stays put while initializing or when signed in', () => {
    expect(signInRedirect({ initializing: true, userUid: null })).toBeNull()
    expect(signInRedirect({ initializing: false, userUid: 'uid-1' })).toBeNull()
  })
})

describe('admin guard', () => {
  const signedIn = { initializing: false, userUid: 'uid-1' }

  it('sends logged-out visitors to sign-in', () => {
    expect(adminRedirect({ initializing: false, userUid: null, role: undefined, rolePending: true })).toBe(
      '/sign-in',
    )
  })

  it('waits while the role is loading', () => {
    expect(adminRedirect({ ...signedIn, role: undefined, rolePending: true })).toBeNull()
  })

  it('sends non-admins to their account page', () => {
    expect(adminRedirect({ ...signedIn, role: 'user', rolePending: false })).toBe('/account')
  })

  it('lets admins through', () => {
    expect(adminRedirect({ ...signedIn, role: 'admin', rolePending: false })).toBeNull()
  })

  it('treats a missing role as non-admin', () => {
    expect(adminRedirect({ ...signedIn, role: null, rolePending: false })).toBe('/account')
  })
})
