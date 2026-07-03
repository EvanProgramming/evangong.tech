// Gallery data source: categories + image providers.
//
// Category set mirrors Home's FlowingMenu (Paris / Chaoshan / Beijing /
// Miscellaneous) and reuses the exact same photography picks as that component
// so the two stay in sync. Each category maps to its own Dome Gallery route.
//
// Image strategy: the curated per-category photo sets are not yet provided, so
// getCategoryImages() returns local SVG data-URI placeholders (dark + cyan,
// fixed 3:4 portrait) for now. Swapping in real photos later is a one-line
// change — replace the placeholder body with `import.meta.glob` results.

import parisImg from '/Photography/Paris/IMG_1598.jpg'
import chaoshanImg from '/Photography/Chaoshan/A395CF89-F602-44F6-97F0-747AD556F2C4_1_105_c.jpeg'
import beijingImg from '/Photography/Beijing/we-o_rd35vfjgdnyzud3fw-china-7504392.jpg'
import miscImg from '/Photography/Miscellaneous/639F42E1-5B22-40AE-BDF9-3974A03E2073_1_105_c.jpeg'

export const CATEGORIES = [
  {
    id: 'paris',
    label: 'Paris, France',
    description: 'Light, geometry, and the quiet rhythm of a city that never stops posing.',
    heroImage: parisImg,
    route: '/gallery/paris',
  },
  {
    id: 'chaoshan',
    label: 'Chaoshan, China',
    description: 'Coastal warmth, teahouse calm, and the texture of everyday southern life.',
    heroImage: chaoshanImg,
    route: '/gallery/chaoshan',
  },
  {
    id: 'beijing',
    label: 'Beijing, China',
    description: 'Imperial scale meets street-level intimacy under a wide northern sky.',
    heroImage: beijingImg,
    route: '/gallery/beijing',
  },
  {
    id: 'miscellaneous',
    label: 'Miscellaneous',
    description: 'Frames without a home — experiments, detours, and moments in between.',
    heroImage: miscImg,
    route: '/gallery/miscellaneous',
  },
]

// Items shaped for <InfiniteMenu />: { image, link, title, description }.
export const infiniteMenuItems = CATEGORIES.map(c => ({
  image: c.heroImage,
  link: c.route,
  title: c.label,
  description: c.description,
}))

export function getCategory(id) {
  return CATEGORIES.find(c => c.id === id) || null
}

export function isValidCategory(id) {
  return CATEGORIES.some(c => c.id === id)
}

// Build an SVG data-URI placeholder. 3:4 portrait to match the intended final
// photo ratio; dark background + cyan label so it reads as a deliberate
// placeholder on the black site palette. `index/total` lets each tile differ
// slightly so the dome isn't a uniform field.
function makePlaceholder(label, index, total) {
  const safeLabel = label.replace(/[<&>]/g, ch => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[ch]))
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800">
  <rect width="600" height="800" fill="#0b0b0b"/>
  <rect x="16" y="16" width="568" height="768" fill="none" stroke="#00f0ff" stroke-opacity="0.22" stroke-width="2"/>
  <text x="300" y="395" font-family="Inter, system-ui, sans-serif" font-size="34" font-weight="800" fill="#00f0ff" text-anchor="middle" letter-spacing="1">${safeLabel}</text>
  <text x="300" y="440" font-family="Inter, system-ui, sans-serif" font-size="18" fill="#9c9c9c" text-anchor="middle">placeholder · ${index + 1}/${total}</text>
</svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

// Returns the image list for a category's Dome Gallery. Placeholders for now —
// replace the body with real `import.meta.glob` results once photos are ready.
export function getCategoryImages(id) {
  const cat = getCategory(id)
  if (!cat) return []
  const TOTAL = 8
  return Array.from({ length: TOTAL }, (_, i) => ({
    src: makePlaceholder(cat.label, i, TOTAL),
    alt: `${cat.label} — placeholder ${i + 1} of ${TOTAL}`,
  }))
}
