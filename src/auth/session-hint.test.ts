import { describe, expect, it } from 'vitest'
import { clearSessionHint, hasSessionHint, setSessionHint } from './session-hint'

describe('session hint', () => {
  it('starts absent, sets on sign-in and clears on sign-out', () => {
    window.localStorage.clear()
    expect(hasSessionHint()).toBe(false)
    setSessionHint()
    expect(hasSessionHint()).toBe(true)
    clearSessionHint()
    expect(hasSessionHint()).toBe(false)
  })

  it('ignores any unexpected stored value', () => {
    window.localStorage.clear()
    window.localStorage.setItem('farmish:session', 'yes')
    expect(hasSessionHint()).toBe(false)
  })
})
