import { describe, expect, it } from 'vitest'
import { getPublicRoutes, getSeoForPath, getStructuredData } from './seo.js'

describe('SEO route manifest', () => {
  it('covers every public route family with canonical metadata', () => {
    expect(getPublicRoutes()).toContain('/about')
    expect(getPublicRoutes()).toContain('/gallery/paris')
    expect(getPublicRoutes()).toContain('/blog/openkyrozen-agent')
    expect(getSeoForPath('/projects').canonical).toBe('https://evangong.tech/projects')
  })

  it('uses article frontmatter for blog metadata and Article JSON-LD', () => {
    const seo = getSeoForPath('/blog/hardware-agent-runtime')
    const graph = getStructuredData(seo)['@graph']
    const article = graph.find(node => node['@type'] === 'Article')

    expect(seo.description).toContain('Hardware Agent Runtime')
    expect(article.datePublished).toBe('2026-06-30')
    expect(article.author['@id']).toBe('https://evangong.tech/#person')
  })

  it('rejects unknown blog and gallery routes', () => {
    expect(getSeoForPath('/blog/not-real')).toBeNull()
    expect(getSeoForPath('/gallery/not-real')).toBeNull()
  })
})
