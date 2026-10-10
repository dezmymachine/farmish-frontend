import { describe, expect, it } from 'vitest'
import { firebaseErrorMessage } from './errors'

describe('firebase error copy', () => {
  it('maps known codes to friendly copy', () => {
    expect(firebaseErrorMessage('auth/invalid-credential')).toBe('Those sign-in details are incorrect.')
    expect(firebaseErrorMessage('auth/invalid-phone-number')).toContain('024 123 4567')
    expect(firebaseErrorMessage('auth/too-many-requests')).toContain('wait a moment')
  })

  it('falls back for unknown, missing or non-string codes', () => {
    expect(firebaseErrorMessage('auth/something-new')).toBe('Sign-in failed. Please try again.')
    expect(firebaseErrorMessage(undefined)).toBe('Sign-in failed. Please try again.')
    expect(firebaseErrorMessage(42)).toBe('Sign-in failed. Please try again.')
  })
})
