const markdownModules = import.meta.glob('../../content/blog/*.md', {
  eager: true,
  query: '?raw',
  import: 'default'
})

const FALLBACK_COVER = '/Photography/Paris/IMG_1430.jpeg'

// The blog frontmatter intentionally uses a small, browser-safe schema:
// strings, booleans, numbers, and simple string arrays. Keeping this parser
// local avoids shipping Node's Buffer polyfill to a static Vite site.
function parseFrontmatter(source) {
  const match = source.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/)
  if (!match) return { data: {}, content: source }

  const data = {}
  let activeArray = null

  match[1].split('\n').forEach(line => {
    if (!line.trim()) return
    const arrayItem = line.match(/^\s+-\s+(.+)$/)
    if (arrayItem && activeArray) {
      data[activeArray].push(arrayItem[1].trim().replace(/^['"]|['"]$/g, ''))
      return
    }

    const field = line.match(/^([\w-]+):\s*(.*)$/)
    if (!field) return
    const [, key, rawValue] = field
    if (!rawValue) {
      data[key] = []
      activeArray = key
      return
    }

    activeArray = null
    const value = rawValue.trim().replace(/^['"]|['"]$/g, '')
    if (value === 'true' || value === 'false') data[key] = value === 'true'
    else if (/^\d+$/.test(value)) data[key] = Number(value)
    else data[key] = value
  })

  return { data, content: match[2] }
}

function normalizeArticle(file, source) {
  const { data, content } = parseFrontmatter(source)
  const fallbackSlug = file.split('/').pop().replace(/\.md$/, '')
  const slug = typeof data.slug === 'string' && data.slug.trim() ? data.slug.trim() : fallbackSlug
  const title = typeof data.title === 'string' && data.title.trim() ? data.title.trim() : slug
  const excerpt = typeof data.excerpt === 'string' ? data.excerpt.trim() : ''
  const author = typeof data.author === 'string' && data.author.trim() ? data.author.trim() : 'Evan Gong'
  const modified = typeof data.modified === 'string' ? data.modified : date
  const imageAlt = typeof data.imageAlt === 'string' ? data.imageAlt.trim() : `${title} cover`
  const keywords = Array.isArray(data.keywords) ? data.keywords.filter(Boolean).map(String) : tags
  const date = data.date instanceof Date
    ? data.date.toISOString().slice(0, 10)
    : typeof data.date === 'string' ? data.date : ''
  const tags = Array.isArray(data.tags) ? data.tags.filter(Boolean).map(String) : []
  const readingTime = Number.isFinite(Number(data.readingTime)) ? Number(data.readingTime) : 1

  return {
    slug,
    title,
    excerpt,
    author,
    modified,
    imageAlt,
    keywords,
    date,
    year: date.slice(0, 4) || 'Undated',
    tags,
    featured: data.featured === true,
    cover: typeof data.cover === 'string' && data.cover.trim() ? data.cover.trim() : FALLBACK_COVER,
    readingTime,
    content,
  }
}

export const articles = Object.entries(markdownModules)
  .map(([file, source]) => normalizeArticle(file, source))
  .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title))

export const featuredArticles = articles.filter(article => article.featured)

export const articleTags = [...new Set(articles.flatMap(article => article.tags))].sort((a, b) => a.localeCompare(b))

export function getArticle(slug) {
  return articles.find(article => article.slug === slug) || null
}

export function getArticlesByTag(tag) {
  if (!tag) return articles
  return articles.filter(article => article.tags.includes(tag))
}
