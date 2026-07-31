// Gallery data source: categories + image providers.
//
// Category set mirrors Home's FlowingMenu (Paris / Chaoshan / Beijing /
// Miscellaneous). Each category maps to its own Dome Gallery route and pulls
// real photographs from /public/Photography/<category>/.

// Vite-specific: eagerly import every photo in each category folder so the
// bundled URLs are available synchronously. Sort alphabetically so the sets are
// deterministic.
const parisImages = Object.values(
  import.meta.glob('/public/Photography/Paris/*.{jpeg,jpg,png,webp}', {
    eager: true,
    query: '?url',
    import: 'default',
  })
).sort()

const chaoshanImages = Object.values(
  import.meta.glob('/public/Photography/Chaoshan/*.{jpeg,jpg,png,webp}', {
    eager: true,
    query: '?url',
    import: 'default',
  })
).sort()

const beijingImages = Object.values(
  import.meta.glob('/public/Photography/Beijing/*.{jpeg,jpg,png,webp}', {
    eager: true,
    query: '?url',
    import: 'default',
  })
).sort()

const miscellaneousImages = Object.values(
  import.meta.glob('/public/Photography/Miscellaneous/*.{jpeg,jpg,png,webp}', {
    eager: true,
    query: '?url',
    import: 'default',
  })
).sort()

const CATEGORY_IMAGES = {
  paris: parisImages,
  chaoshan: chaoshanImages,
  beijing: beijingImages,
  miscellaneous: miscellaneousImages,
}

export const CATEGORIES = [
  {
    id: 'paris',
    label: 'Paris, France',
    description: 'Light, geometry, and the quiet rhythm of a city that never stops posing.',
    heroImage: parisImages[0] || '',
    route: '/gallery/paris',
  },
  {
    id: 'chaoshan',
    label: 'Chaoshan, China',
    description: 'Coastal warmth, teahouse calm, and the texture of everyday southern life.',
    heroImage: chaoshanImages[0] || '',
    route: '/gallery/chaoshan',
  },
  {
    id: 'beijing',
    label: 'Beijing, China',
    description: 'Imperial scale meets street-level intimacy under a wide northern sky.',
    heroImage: beijingImages[0] || '',
    route: '/gallery/beijing',
  },
  {
    id: 'miscellaneous',
    label: 'Miscellaneous',
    description: 'Frames without a home — experiments, detours, and moments in between.',
    heroImage: miscellaneousImages[0] || '',
    route: '/gallery/miscellaneous',
  },
]

// Items shaped for <InfiniteMenu />: { image, link, title, description }.
export const infiniteMenuItems = CATEGORIES.map((c) => ({
  image: c.heroImage,
  link: c.route,
  title: c.label,
  description: c.description,
}))

export function getCategory(id) {
  return CATEGORIES.find((c) => c.id === id) || null
}

export function isValidCategory(id) {
  return CATEGORIES.some((c) => c.id === id)
}

// Returns the image list for a category's Dome Gallery. The real photos live in
// /public/Photography/<category>/; if a folder is empty, an empty array is
// returned so the component can decide how to handle it.
export function getCategoryImages(id) {
  const cat = getCategory(id)
  if (!cat) return []
  const images = CATEGORY_IMAGES[id] || []
  return images.map((src, i) => ({
    src,
    alt: `${cat.label} — photo ${i + 1} of ${images.length}`,
  }))
}
