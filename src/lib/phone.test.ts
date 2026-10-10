import { describe, expect, it } from 'vitest'
import { formatGhPhone, isGhPhoneE164, normalizeGhPhone } from './phone'

describe('Ghana phone helpers', () => {
  it('normalises local, 233-prefixed and E.164 input', () => {
    expect(normalizeGhPhone('0241234567')).toBe('+233241234567')
    expect(normalizeGhPhone('024 123 4567')).toBe('+233241234567')
    expect(normalizeGhPhone('024-123-4567')).toBe('+233241234567')
    expect(normalizeGhPhone('233241234567')).toBe('+233241234567')
    expect(normalizeGhPhone('+233241234567')).toBe('+233241234567')
  })

  it('rejects short, long and foreign numbers', () => {
    expect(normalizeGhPhone('024123456')).toBeNull()
    expect(normalizeGhPhone('02412345678')).toBeNull()
    expect(normalizeGhPhone('+2348012345678')).toBeNull()
    expect(normalizeGhPhone('not-a-number')).toBeNull()
    expect(normalizeGhPhone('')).toBeNull()
  })

  it('validates E.164 strictly', () => {
    expect(isGhPhoneE164('+233241234567')).toBe(true)
    expect(isGhPhoneE164('0241234567')).toBe(false)
    expect(isGhPhoneE164('+233 241234567')).toBe(false)
  })

  it('formats E.164 for display and passes the rest through', () => {
    expect(formatGhPhone('+233241234567')).toBe('024 123 4567')
    expect(formatGhPhone('0241234567')).toBe('0241234567')
  })
})
