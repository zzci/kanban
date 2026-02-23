import { resolve } from 'node:path'
import { Hono } from 'hono'
import { compress } from 'hono/compress'
import { serveStatic } from 'hono/bun'
import { apiRoutes } from './routes'

const isProduction = process.env.NODE_ENV === 'production'
const staticRoot = resolve(import.meta.dir, '../frontend/dist')

const app = new Hono()

app.use(compress())
app.route('/api', apiRoutes)

app.all('/api/*', (c) => {
  return c.json(
    {
      error: 'Not Found',
      code: 'API_NOT_FOUND',
    },
    404,
  )
})

if (isProduction) {
  // Hashed assets: long-term immutable cache
  app.use(
    '/assets/*',
    serveStatic({
      root: staticRoot,
      onFound: (_path, c) => {
        c.header('Cache-Control', 'public, max-age=31536000, immutable')
      },
    }),
  )

  // Other static files (favicon, manifest, logos): short cache with revalidation
  app.use(
    '*',
    serveStatic({
      root: staticRoot,
      onFound: (_path, c) => {
        c.header('Cache-Control', 'public, max-age=3600, must-revalidate')
      },
    }),
  )

  // SPA fallback: always revalidate
  app.get(
    '*',
    serveStatic({
      root: staticRoot,
      path: 'index.html',
      onFound: (_path, c) => {
        c.header('Cache-Control', 'no-cache')
      },
    }),
  )
}

export default app
