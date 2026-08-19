import { describe, it, expect } from 'vitest'
import {
  CATEGORIES,
  infiniteMenuItems,
  getCategory,
  isValidCategory,
  getCategoryImages,
} from './galleryData.js'

// galleryData is the single source of truth for the Gallery page: it defines
// the 4 photography categories (mirroring Home's FlowingMenu), shapes items for
// InfiniteMenu, and provides real photographs for DomeGallery.
describe('galleryData', () => {
  describe('CATEGORIES', () => {
    it('defines exactly 4 categories matching Home FlowingMenu', () => {
      expect(CATEGORIES).toHaveLength(4)
      const labels = CATEGORIES.map((c) => c.label)
      expect(labels).toEqual([
        'Paris, France',
        'Chaoshan, China',
        'Beijing, China',
        'Miscellaneous',
      ])
    })

    it('every category has the required fields with correct types', () => {
      CATEGORIES.forEach((cat) => {
        expect(typeof cat.id).toBe('string')
        expect(cat.id.length).toBeGreaterThan(0)
        expect(typeof cat.label).toBe('string')
        expect(typeof cat.description).toBe('string')
        expect(cat.description.length).toBeGreaterThan(0)
        expect(typeof cat.heroImage).toBe('string')
        expect(typeof cat.route).toBe('string')
        expect(cat.route).toMatch(/^\/gallery\//)
      })
    })

    it('category ids are unique', () => {
      const ids = CATEGORIES.map((c) => c.id)
      expect(new Set(ids).size).toBe(ids.length)
    })

    it('every category route matches /gallery/<id>', () => {
      CATEGORIES.forEach((cat) => {
        expect(cat.route).toBe(`/gallery/${cat.id}`)
      })
    })
  })

  describe('infiniteMenuItems', () => {
    it('produces one InfiniteMenu item per category, in order', () => {
      expect(infiniteMenuItems).toHaveLength(CATEGORIES.length)
    })

    it('each item is shaped { image, link, title, description }', () => {
      infiniteMenuItems.forEach((item, i) => {
        expect(item.image).toBe(CATEGORIES[i].heroImage)
        expect(item.link).toBe(CATEGORIES[i].route)
        expect(item.title).toBe(CATEGORIES[i].label)
        expect(item.description).toBe(CATEGORIES[i].description)
      })
    })
  })

  describe('getCategory', () => {
    it('returns the matching category object', () => {
      const paris = getCategory('paris')
      expect(paris).not.toBeNull()
      expect(paris.id).toBe('paris')
    })

    it('returns null for an unknown id', () => {
      expect(getCategory('nonexistent')).toBeNull()
    })

    it('returns null for undefined / null input', () => {
      expect(getCategory(undefined)).toBeNull()
      expect(getCategory(null)).toBeNull()
    })
  })

  describe('isValidCategory', () => {
    it.each(['paris', 'chaoshan', 'beijing', 'miscellaneous'])(
      'returns true for known category "%s"',
      (id) => {
        expect(isValidCategory(id)).toBe(true)
      }
    )

    it('returns false for an unknown id', () => {
      expect(isValidCategory('tokyo')).toBe(false)
    })

    it('returns false for undefined input', () => {
      expect(isValidCategory(undefined)).toBe(false)
    })
  })

  describe('getCategoryImages', () => {
    it('returns at least one image for every valid category', () => {
      CATEGORIES.forEach((cat) => {
        const images = getCategoryImages(cat.id)
        expect(images.length).toBeGreaterThan(0)
      })
    })

    it('each image has src and alt strings', () => {
      const images = getCategoryImages('beijing')
      images.forEach((img, i) => {
        expect(typeof img.src).toBe('string')
        expect(img.src.length).toBeGreaterThan(0)
        expect(typeof img.alt).toBe('string')
        expect(img.alt).toContain('Beijing, China')
        expect(img.alt).toContain(`${i + 1}`)
        expect(img.width).toBeGreaterThan(0)
        expect(img.height).toBeGreaterThan(0)
        expect(img.sizes).toContain('vw')
        expect(img).toHaveProperty('exif')
        if (img.exif !== null) {
          expect(typeof img.exif).toBe('object')
        }
      })
    })

    it('srcs are bundled URLs or absolute paths (no SVG placeholders)', () => {
      const images = getCategoryImages('paris')
      images.forEach((img) => {
        expect(img.src).not.toMatch(/^data:image\/svg\+xml/)
      })
    })

    it('srcs are unique within a category', () => {
      const images = getCategoryImages('chaoshan')
      const srcs = images.map((i) => i.src)
      expect(new Set(srcs).size).toBe(srcs.length)
    })

    it('returns an empty array for an unknown category', () => {
      expect(getCategoryImages('nonexistent')).toEqual([])
    })
  })
})
