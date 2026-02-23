import { resolve } from 'node:path'
import { serveStatic } from 'hono/bun'
import app from './app'
import { logger } from './logger'

const listenHost = process.env.API_HOST ?? '0.0.0.0'
const listenPort = Number(process.env.API_PORT ?? 3000)
const staticRoot = resolve(import.meta.dir, '../frontend/dist')

// Static file serving (index.ts is only used in production)
app.use(
  '/assets/*',
  serveStatic({
    root: staticRoot,
    onFound: (_path, c) => {
      c.header('Cache-Control', 'public, max-age=31536000, immutable')
    },
  }),
)

app.use(
  '*',
  serveStatic({
    root: staticRoot,
    onFound: (_path, c) => {
      c.header('Cache-Control', 'public, max-age=3600, must-revalidate')
    },
  }),
)

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

const http = Bun.serve({
  port: listenPort,
  hostname: listenHost,
  idleTimeout: 60,
  fetch: app.fetch,
})

logger.info('server_started', {
  host: listenHost,
  port: listenPort,
  serverName: 'kanban-api',
  version: 'dev',
})

let isShuttingDown = false

async function shutdown(signal: string) {
  if (isShuttingDown) {
    return
  }
  isShuttingDown = true

  logger.warn('server_shutdown', { signal })
  http.stop()
  logger.info('server_stopped')
  process.exit(0)
}

process.on('SIGINT', () => {
  void shutdown('SIGINT')
})
process.on('SIGTERM', () => {
  void shutdown('SIGTERM')
})
