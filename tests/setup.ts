import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// testing-library's auto-cleanup needs globals; unmount explicitly instead
// so open dialogs from one test never leak into the next.
afterEach(() => {
  cleanup()
})
