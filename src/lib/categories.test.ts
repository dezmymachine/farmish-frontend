import { describe, expect, it } from 'vitest'
import { FALLBACK_CATEGORIES, categorySearchTo, textSearchTo } from './categories'

describe('fallback categories', () => {
  it('lists the twelve DOMAIN §9 parents in order', () => {
    expect(FALLBACK_CATEGORIES).toHaveLength(12)
    expect(FALLBACK_CATEGORIES.map((cat) => cat.slug)).toEqual([
      'seeds-seedlings',
      'fertilizers-chemicals',
      'farm-machinery',
      'livestock-poultry',
      'feeds-supplements',
      'fresh-produce',
      'processed-foods',
      'farm-labour',
      'land-leasing',
      'storage-packaging',
      'veterinary',
      'irrigation',
    ])
  })

  it('drops & from child slugs per the slugify rule', () => {
    const seeds = FALLBACK_CATEGORIES[0]
    expect(seeds?.children.find((kid) => kid.name === 'Flowers & Ornamentals')?.slug).toBe(
      'seeds-seedlings-flowers-ornamentals',
    )
  })

  it('leaves childless parents with an empty list', () => {
    expect(FALLBACK_CATEGORIES.at(-1)?.children).toEqual([])
  })
})

describe('search link helpers', () => {
  it('points a category at /search?category=', () => {
    expect(categorySearchTo('seeds-seedlings')).toEqual({
      to: '/search',
      search: { category: 'seeds-seedlings' },
    })
  })

  it('trims the text query and drops empties', () => {
    expect(textSearchTo('  maize seed  ')).toEqual({ to: '/search', search: { q: 'maize seed' } })
    expect(textSearchTo('   ')).toEqual({ to: '/search', search: {} })
  })
})
