import { describe, expect, it } from 'vitest'
import { cn } from './utils'

describe('cn', () => {
  it('merges conflicting Tailwind classes', () => {
    expect(cn('px-4', 'px-8')).toBe('px-8')
  })

  it('ignores falsy inputs', () => {
    const maybeHidden = '' as string | false
    expect(cn('t-ui', maybeHidden && 'hidden', undefined)).toBe('t-ui')
  })
})
