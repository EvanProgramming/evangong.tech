import { describe, expect, it } from 'vitest'
import { articleTags, articles, featuredArticles, getArticle, getArticlesByTag } from './blogData.js'

describe('blogData', () => {
  it('loads and normalizes the three launch articles', () => {
    expect(articles).toHaveLength(3)
    expect(articles.every(article => article.slug && article.title && article.content)).toBe(true)
    expect(featuredArticles).toHaveLength(3)
    expect(articles.every(article => article.cover.startsWith('/blog/'))).toBe(true)
  })

  it('sorts articles newest first and exposes unique tags', () => {
    expect(articles.map(article => article.slug)).toEqual([
      'openkyrozen-agent',
      'kards-ai-simulator',
      'hardware-agent-runtime'
    ])
    expect(articleTags).toContain('AI')
    expect(new Set(articleTags).size).toBe(articleTags.length)
  })

  it('finds articles by slug and filters by tag', () => {
    expect(getArticle('openkyrozen-agent').title).toContain('Agent')
    expect(getArticle('missing-article')).toBeNull()
    expect(getArticlesByTag('Hardware').map(article => article.slug)).toEqual(['hardware-agent-runtime'])
    expect(getArticlesByTag('')).toHaveLength(3)
  })
})
