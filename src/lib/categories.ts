/*
 * Category tree fallback for the navbar. The live tree comes from
 * GET /v1/categories (`api/queries/catalog.ts`); when the API is
 * unreachable (CI, offline dev) the menu falls back to these twelve
 * parents from DOMAIN §9 so navigation never renders empty.
 *
 * Shape mirrors the API `CategoryNode` (name/slug/children) so the menu
 * renders identically from either source.
 */

export interface CategoryChild {
  name: string
  slug: string
}

export interface CategoryParent {
  name: string
  slug: string
  children: Array<CategoryChild>
}

function child(parentSlug: string, name: string): CategoryChild {
  const slug = `${parentSlug}-${name
    .toLowerCase()
    .replace(/&/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')}`
  return { name, slug }
}

function parent(name: string, slug: string, kids: Array<string>): CategoryParent {
  return { name, slug, children: kids.map((kid) => child(slug, kid)) }
}

export const FALLBACK_CATEGORIES: Array<CategoryParent> = [
  parent('Seeds & Seedlings', 'seeds-seedlings', [
    'Cereal Seeds',
    'Vegetable Seeds',
    'Fruit Seeds',
    'Tree Crop Seedlings',
    'Flowers & Ornamentals',
    'Pasture Seeds',
    'Seedlings & Cuttings',
  ]),
  parent('Fertilizers & Chemicals', 'fertilizers-chemicals', [
    'NPK Fertilizers',
    'Organic Fertilizers',
    'Liquid Fertilizers',
    'Pesticides',
    'Herbicides',
    'Fungicides',
    'Growth Regulators',
  ]),
  parent('Farm Machinery', 'farm-machinery', [
    'Tractors',
    'Tillers & Cultivators',
    'Harvesters',
    'Sprayers',
    'Irrigation Equipment',
    'Processing Machines',
    'Tools & Implements',
  ]),
  parent('Livestock & Poultry', 'livestock-poultry', [
    'Cattle',
    'Sheep & Goats',
    'Pigs',
    'Chickens',
    'Turkeys',
    'Rabbits',
    'Grasscutters',
    'Exotic Animals',
  ]),
  parent('Feeds & Supplements', 'feeds-supplements', [
    'Poultry Feed',
    'Livestock Feed',
    'Fish Feed',
    'Pet Food',
    'Feed Supplements',
    'Vitamins & Minerals',
    'Feed Ingredients',
  ]),
  parent('Fresh Produce', 'fresh-produce', [
    'Vegetables',
    'Fruits',
    'Root Crops',
    'Grains & Cereals',
    'Legumes',
    'Herbs & Spices',
    'Honey & Bee Products',
  ]),
  parent('Processed Foods', 'processed-foods', [
    'Dried & Smoked Fish',
    'Cooking Oils',
    'Flours & Powders',
    'Packaged Foods',
    'Beverages',
    'Snacks',
    'Preserves & Sauces',
  ]),
  parent('Farm Labour', 'farm-labour', [
    'Field Workers',
    'Harvesting Services',
    'Planting Services',
    'Spraying Services',
    'Consulting',
    'Agribusiness Training',
  ]),
  parent('Land & Leasing', 'land-leasing', [
    'Farmland for Rent',
    'Farmland for Sale',
    'Warehouse Space',
    'Cold Storage',
    'Office Space',
    'Greenhouses',
  ]),
  parent('Storage & Packaging', 'storage-packaging', [
    'Sacks & Bags',
    'Crates & Baskets',
    'Packaging Materials',
    'Storage Containers',
    'Labels & Stickers',
  ]),
  parent('Veterinary Services', 'veterinary', [
    'Vaccines',
    'Medications',
    'Veterinary Services',
    'Artificial Insemination',
    'Animal Health Products',
  ]),
  parent('Irrigation Equipment', 'irrigation', []),
]

/** `/search?category=<slug>` is the category landing until F3's `/c/$slug` lands. */
export function categorySearchTo(slug: string): { to: '/search'; search: { category: string } } {
  return { to: '/search', search: { category: slug } }
}

/** `/search?q=<query>`; empty queries go to bare `/search`. */
export function textSearchTo(query: string): { to: '/search'; search: { q?: string } } {
  const trimmed = query.trim()
  return trimmed === '' ? { to: '/search', search: {} } : { to: '/search', search: { q: trimmed } }
}
