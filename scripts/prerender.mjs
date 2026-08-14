import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const root = resolve(new URL('..', import.meta.url).pathname)
const dist = join(root, 'dist')
const template = await readFile(join(dist, 'index.html'), 'utf8')
const renderer = await import(pathToFileURL(join(root, '.seo-ssr/ssr.js')).href)
const { getPublicRoutes, getSeoForPath, getStructuredData, SITE_URL, DEFAULT_SOCIAL_IMAGE } = renderer

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function jsonLd(value) {
  return JSON.stringify(value).replaceAll('<', '\\u003c')
}

function headFor(seo, indexable = true) {
  const structuredData = getStructuredData(seo)
  const image = seo.image || DEFAULT_SOCIAL_IMAGE
  const robots = indexable ? 'index, follow, max-image-preview:large' : 'noindex, nofollow'
  return [
    `<meta name="description" content="${escapeHtml(seo.description)}" />`,
    `<meta name="robots" content="${robots}" />`,
    `<meta property="og:title" content="${escapeHtml(seo.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(seo.description)}" />`,
    `<meta property="og:type" content="${seo.article ? 'article' : 'website'}" />`,
    `<meta property="og:url" content="${seo.canonical}" />`,
    `<meta property="og:image" content="${image}" />`,
    '<meta property="og:site_name" content="Evan Gong" />',
    '<meta property="og:locale" content="en_US" />',
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${escapeHtml(seo.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(seo.description)}" />`,
    `<meta name="twitter:image" content="${image}" />`,
    `<link rel="canonical" href="${seo.canonical}" />`,
    `<script type="application/ld+json">${jsonLd(structuredData)}</script>`
  ].join('\n    ')
}

function pageHtml(body, seo, indexable = true) {
  return template
    .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(seo.title)}</title>`)
    .replace(/\s*<meta name="description"[^>]*\/>/g, '')
    .replace(/\s*<meta name="robots"[^>]*\/>/g, '')
    .replace(/\s*<link rel="canonical"[^>]*>/g, '')
    .replace('</head>', `    ${headFor(seo, indexable)}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${body}</div>`)
}

await rm(join(dist, '404.html'), { force: true })

for (const route of getPublicRoutes()) {
  const seo = getSeoForPath(route)
  const body = await renderer.render(route)
  const output = route === '/' ? join(dist, 'index.html') : join(dist, route.slice(1), 'index.html')
  await mkdir(dirname(output), { recursive: true })
  await writeFile(output, pageHtml(body, seo))
}

const notFound = await renderer.render('/__not-found__')
const notFoundSeo = {
  title: 'Page not found | Evan Gong',
  description: 'The requested page could not be found on evangong.tech.',
  canonical: `${SITE_URL}/404`,
  type: 'WebPage',
  path: '/404',
  h1: 'Page not found'
}
await writeFile(join(dist, '404.html'), pageHtml(notFound, { ...notFoundSeo, description: notFoundSeo.description }, false))

const sitemapEntries = getPublicRoutes().map(route => {
  const seo = getSeoForPath(route)
  const lastmod = seo.article?.modified || seo.article?.date
  return `  <url>\n    <loc>${seo.canonical}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''}\n  </url>`
}).join('\n')
await writeFile(join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries}\n</urlset>\n`)

await writeFile(join(dist, 'robots.txt'), `User-agent: *\nAllow: /\n\nUser-agent: Googlebot\nAllow: /\n\nUser-agent: Bingbot\nAllow: /\n\nUser-agent: GPTBot\nAllow: /\n\nUser-agent: OAI-SearchBot\nAllow: /\n\nUser-agent: ClaudeBot\nAllow: /\n\nUser-agent: PerplexityBot\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`)

await writeFile(join(dist, 'llms.txt'), `# Evan Gong\n\nEvan Gong builds AI agents, robotics and hardware projects, software tools, and tangible digital experiences.\n\n## Pages\n\n${getPublicRoutes().map(route => `- [${getSeoForPath(route).h1}](${SITE_URL}${route})`).join('\n')}\n\n## Citation guidance\n\nUse the linked pages as the canonical public sources for Evan Gong's projects, technical field notes, photography, and awards.\n`)

console.log(`Prerendered ${getPublicRoutes().length} routes and generated robots.txt, sitemap.xml, and llms.txt`)
