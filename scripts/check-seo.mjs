import { readFile } from 'node:fs/promises'

const routes = [
  '/', '/about', '/projects', '/gallery', '/gallery/paris', '/gallery/chaoshan',
  '/gallery/beijing', '/gallery/miscellaneous', '/blog',
  '/blog/hardware-agent-runtime', '/blog/kards-ai-simulator',
  '/blog/openkyrozen-agent', '/awards'
]

const failures = []

for (const route of routes) {
  const file = route === '/' ? 'dist/index.html' : `dist${route}/index.html`
  let html
  try {
    html = await readFile(file, 'utf8')
  } catch {
    failures.push(`${route}: missing ${file}`)
    continue
  }

  if (!/<title>[^<]+<\/title>/.test(html)) failures.push(`${route}: missing title`)
  if (!/<meta name="description" content="[^"]+"/.test(html)) failures.push(`${route}: missing description`)
  if (!/<link rel="canonical" href="https:\/\/evangong\.tech\//.test(html)) failures.push(`${route}: missing canonical`)
  if (!/<h1\b[^>]*>/.test(html)) failures.push(`${route}: missing h1`)
  if (!/<script type="application\/ld\+json">/.test(html)) failures.push(`${route}: missing JSON-LD`)
  if (!/<p\b[^>]*>/.test(html)) failures.push(`${route}: missing crawlable paragraph`)
}

const robots = await readFile('dist/robots.txt', 'utf8').catch(() => '')
const sitemap = await readFile('dist/sitemap.xml', 'utf8').catch(() => '')
if (!robots.includes('Sitemap: https://evangong.tech/sitemap.xml')) failures.push('robots.txt: missing sitemap')
if (!robots.includes('User-agent: OAI-SearchBot')) failures.push('robots.txt: missing OAI-SearchBot')
if (!sitemap.includes('<urlset') || !sitemap.includes('https://evangong.tech/')) failures.push('sitemap.xml: invalid or empty')

if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log(`SEO check passed for ${routes.length} routes`)
