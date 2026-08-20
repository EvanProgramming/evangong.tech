import { SEO_ARTICLES, SEO_GALLERY_CATEGORIES } from './content.js'

export const SITE_URL = 'https://evangong.tech'
export const DEFAULT_SOCIAL_IMAGE = `${SITE_URL}/social-card.svg`

const BASE_GRAPH = [
  {
    '@type': 'Person',
    '@id': `${SITE_URL}/#person`,
    name: 'Evan Gong',
    url: `${SITE_URL}/`,
    image: DEFAULT_SOCIAL_IMAGE,
    sameAs: [
      'https://github.com/EvanProgramming',
      'https://x.com/EvanGong459069',
      'https://www.instagram.com/evangongtech/'
    ],
    knowsAbout: ['AI agents', 'programming', 'robotics', 'hardware', '3D printing', 'photography']
  },
  {
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: 'Evan Gong',
    url: `${SITE_URL}/`,
    publisher: { '@id': `${SITE_URL}/#person` }
  }
]

const PAGE_META = {
  '/': {
    title: 'Evan Gong | AI, Robotics, Hardware & Photography',
    description: 'Evan Gong builds AI agents, robotics and hardware projects, software tools, and tangible digital experiences.',
    h1: 'Evan Gong',
    type: 'WebPage',
    keywords: ['Evan Gong', 'AI agents', 'robotics', 'hardware projects', 'software projects', 'photography']
  },
  '/about': {
    title: 'About Evan Gong | Developer, AI & Hardware Builder',
    description: 'Learn about Evan Gong, a developer exploring AI, programming, robotics, hardware projects, and creative technology.',
    h1: "Hi, I'm Evan",
    type: 'AboutPage',
    keywords: ['Evan Gong developer', 'AI developer', 'robotics', 'hardware projects']
  },
  '/projects': {
    title: 'Projects by Evan Gong | AI, Robotics & Software',
    description: 'Explore Evan Gong\'s software, AI agent, robotics, hardware, macOS, and interactive technology projects.',
    h1: 'Featured Projects',
    type: 'CollectionPage',
    keywords: ['AI projects', 'robotics projects', 'hardware projects', 'software projects']
  },
  '/gallery': {
    title: 'Photography Gallery by Evan Gong',
    description: 'Photography by Evan Gong from Paris, Chaoshan, Beijing, and elsewhere, presented as a location-based visual gallery.',
    h1: 'Gallery',
    type: 'CollectionPage',
    keywords: ['Evan Gong photography', 'Paris photography', 'China photography']
  },
  '/blog': {
    title: 'Field Notes on AI Agents, Hardware & Software | Evan Gong',
    description: 'Technical field notes by Evan Gong on AI agents, embedded hardware, simulation, software systems, and learning.',
    h1: 'Blog',
    type: 'CollectionPage',
    keywords: ['AI agents blog', 'hardware agent runtime', 'reinforcement learning', 'software engineering']
  },
  '/awards': {
    title: 'Awards & Recognition | Evan Gong',
    description: 'Selected awards, program milestones, competition results, and project records from Evan Gong\'s work.',
    h1: 'Awards',
    type: 'CollectionPage',
    keywords: ['Evan Gong awards', 'AI awards', 'hardware awards', 'robotics awards']
  }
}

function normalizePath(pathname) {
  if (!pathname || pathname === '/') return '/'
  return pathname.replace(/\/+$/, '') || '/'
}

function canonicalPath(path) {
  return path === '/' ? '/' : `${path}/`
}

export function getSeoForPath(pathname) {
  const path = normalizePath(pathname)
  if (PAGE_META[path]) return { ...PAGE_META[path], path, canonical: `${SITE_URL}${canonicalPath(path)}` }

  const blogMatch = path.match(/^\/blog\/([^/]+)$/)
  if (blogMatch) {
    const article = SEO_ARTICLES[blogMatch[1]]
    if (!article) return null
    return {
      title: `${article.title} | Evan Gong`,
      description: article.excerpt,
      h1: article.title,
      path,
      canonical: `${SITE_URL}${canonicalPath(path)}`,
      type: 'WebPage',
      image: `${SITE_URL}${article.cover}`,
      keywords: article.tags,
      article
    }
  }

  const galleryMatch = path.match(/^\/gallery\/([^/]+)$/)
  if (galleryMatch) {
    const category = SEO_GALLERY_CATEGORIES[galleryMatch[1]]
    if (!category) return null
    return {
      title: `${category.label} Photography | Evan Gong`,
      description: category.description,
      h1: category.label,
      path,
      canonical: `${SITE_URL}${canonicalPath(path)}`,
      type: 'ImageGallery',
      keywords: ['Evan Gong photography', category.label]
    }
  }

  return null
}

export function getPublicRoutes() {
  return [
    ...Object.keys(PAGE_META).map(canonicalPath),
    '/gallery/paris/',
    '/gallery/chaoshan/',
    '/gallery/beijing/',
    '/gallery/miscellaneous/',
    ...Object.keys(SEO_ARTICLES).map(slug => `/blog/${slug}/`)
  ]
}

export function getStructuredData(seo) {
  const pageId = `${seo.canonical}#webpage`
  const graph = [
    ...BASE_GRAPH,
    {
      '@type': seo.type,
      '@id': pageId,
      url: seo.canonical,
      name: seo.title,
      description: seo.description,
      isPartOf: { '@id': `${SITE_URL}/#website` },
      about: { '@id': `${SITE_URL}/#person` }
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${seo.canonical}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
        ...(seo.path !== '/' ? [{ '@type': 'ListItem', position: 2, name: seo.h1, item: seo.canonical }] : [])
      ]
    }
  ]

  if (seo.article) {
    graph.push({
      '@type': 'Article',
      '@id': `${seo.canonical}#article`,
      headline: seo.article.title,
      description: seo.article.excerpt,
      datePublished: seo.article.date,
      dateModified: seo.article.modified || seo.article.date,
      author: { '@id': `${SITE_URL}/#person` },
      image: [seo.image],
      mainEntityOfPage: { '@id': pageId },
      articleSection: seo.article.tags
    })
  }

  return { '@context': 'https://schema.org', '@graph': graph }
}
