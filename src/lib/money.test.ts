import { describe, expect, it } from 'vitest'
import { formatMoney } from './money'

describe('formatMoney', () => {
  it.each([
    [0, 'GH₵0.00'],
    [1, 'GH₵0.01'],
    [100, 'GH₵1.00'],
    [1250, 'GH₵12.50'],
    [100000000, 'GH₵1,000,000.00'],
  ])('formats %i pesewas as %s', (amount, expected) => {
    expect(formatMoney({ amount, currency: 'GHS' })).toBe(expected)
  })
})
