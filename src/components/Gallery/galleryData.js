// Gallery data source: categories + image providers.
//
import { getPhotosByCategory, PHOTO_CATEGORIES } from '../../data/photoCatalog.js'

export const CATEGORIES = PHOTO_CATEGORIES.map(category => ({
  ...category,
  heroImage: getPhotosByCategory(category.id)[0]?.src || '',
  route: `/gallery/${category.id}`
}))

// Items shaped for <InfiniteMenu />: { image, link, title, description }.
export const infiniteMenuItems = CATEGORIES.map((c) => ({
  image: c.heroImage,
  link: c.route,
  title: c.label,
  description: c.description,
}))

export function getCategory(id) {
  return CATEGORIES.find(category => category.id === id) || null
}

export function isValidCategory(id) {
  return CATEGORIES.some((c) => c.id === id)
}

export function getCategoryImages(id) {
  return getPhotosByCategory(id)
}
