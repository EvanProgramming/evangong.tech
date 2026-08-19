import manifest from '../../photo-protection-manifest.json'

const CATEGORY_LABELS = {
  Paris: 'Paris, France',
  Chaoshan: 'Chaoshan, China',
  Beijing: 'Beijing, China',
  Miscellaneous: 'Miscellaneous'
}

function normalizeExif(exif) {
  if (!exif || typeof exif !== 'object') return null

  const normalized = {}
  const allowedFields = ['Make', 'Model', 'LensModel', 'DateTimeOriginal', 'FocalLength', 'FNumber', 'ExposureTime', 'ISO']

  for (const field of allowedFields) {
    const value = exif[field]
    if (value == null) continue
    if (typeof value === 'string') {
      const trimmed = value.trim()
      if (trimmed) normalized[field] = trimmed
      continue
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
      normalized[field] = value
      continue
    }
  }

  return Object.keys(normalized).length > 0 ? normalized : null
}

const publicPhotos = manifest.assets
  .filter(asset => asset.path.startsWith('public/Photography/'))
  .map(asset => {
    const path = asset.path.replace(/^public/, '')
    const [, category] = path.split('/')
    const label = CATEGORY_LABELS[category] || category
    return {
      src: path,
      alt: `${label} photograph`,
      category: category.toLowerCase(),
      width: asset.width,
      height: asset.height,
      sizes: '(max-width: 640px) 46vw, (max-width: 1200px) 30vw, 420px',
      exif: normalizeExif(asset.exif)
    }
  })
  .sort((a, b) => a.src.localeCompare(b.src))

export const PHOTO_CATEGORIES = [
  {
    id: 'paris',
    label: 'Paris, France',
    description: 'Light, geometry, and the quiet rhythm of a city that never stops posing.',
    path: '/Photography/Paris/'
  },
  {
    id: 'chaoshan',
    label: 'Chaoshan, China',
    description: 'Coastal warmth, teahouse calm, and the texture of everyday southern life.',
    path: '/Photography/Chaoshan/'
  },
  {
    id: 'beijing',
    label: 'Beijing, China',
    description: 'Imperial scale meets street-level intimacy under a wide northern sky.',
    path: '/Photography/Beijing/'
  },
  {
    id: 'miscellaneous',
    label: 'Miscellaneous',
    description: 'Frames without a home — experiments, detours, and moments in between.',
    path: '/Photography/Miscellaneous/'
  }
]

export const photoCatalog = publicPhotos

export function getPhotosByCategory(id) {
  const category = PHOTO_CATEGORIES.find(item => item.id === id)
  if (!category) return []
  return publicPhotos
    .filter(photo => photo.src.startsWith(category.path))
    .map((photo, index, photos) => ({
      ...photo,
      alt: `${category.label} — photo ${index + 1} of ${photos.length}`
    }))
}

export function getPhotoCategory(id) {
  return PHOTO_CATEGORIES.find(item => item.id === id) || null
}
