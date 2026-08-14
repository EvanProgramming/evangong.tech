/* oxlint-disable react/only-export-components -- this is a build-only SSR entry. */
import { renderToPipeableStream } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import { PassThrough } from 'node:stream'
import { Layout } from './App.jsx'
import { getPublicRoutes, getSeoForPath, getStructuredData, SITE_URL, DEFAULT_SOCIAL_IMAGE } from './seo/seo.js'

export function render(url) {
  return new Promise((resolve, reject) => {
    const stream = new PassThrough()
    const chunks = []
    stream.on('data', chunk => chunks.push(chunk))
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    stream.on('error', reject)

    const { pipe } = renderToPipeableStream(
      <StaticRouter location={url}>
        <Layout />
      </StaticRouter>,
      {
        onAllReady() {
          pipe(stream)
        },
        onShellError: reject,
        onError(error) {
          if (!error?.message?.includes('document is not defined')) reject(error)
        }
      }
    )
  })
}

export { getPublicRoutes, getSeoForPath, getStructuredData, SITE_URL, DEFAULT_SOCIAL_IMAGE }
