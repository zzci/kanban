import { resolve } from 'node:path'
import app from './app'
import { logger } from './logger'

const listenHost = process.env.API_HOST ?? '0.0.0.0'
const listenPort = Number(process.env.API_PORT ?? 3000)
const isProduction = process.env.NODE_ENV === 'production'
const staticRoot = resolve(import.meta.dir, '../frontend/dist')
const staticRootResolved = resolve(staticRoot)

function isPathInsideRoot(filePath: string, rootPath: string) {
  return filePath === rootPath || filePath.startsWith(`${rootPath}/`)
}

async function serveStatic(pathname: string) {
  const cleanPath = pathname.replace(/^\/+/, '')
  const requested = cleanPath.length === 0 ? 'index.html' : cleanPath
  const requestedPath = resolve(staticRoot, requested)

  if (isPathInsideRoot(requestedPath, staticRootResolved)) {
    const file = Bun.file(requestedPath)
    if (await file.exists()) {
      return new Response(file)
    }
  }

  // SPA fallback: if no extension, return index.html
  if (!requested.includes('.')) {
    const indexFile = Bun.file(resolve(staticRoot, 'index.html'))
    if (await indexFile.exists()) {
      return new Response(indexFile)
    }
  }

  return new Response('Not Found', { status: 404 })
}

const http = Bun.serve({
  port: listenPort,
  hostname: listenHost,
  idleTimeout: 60,
  async fetch(req) {
    const appResponse = await app.fetch(req)
    if (appResponse.status !== 404) {
      return appResponse
    }

    if (isProduction) {
      const url = new URL(req.url)
      return serveStatic(url.pathname)
    }

    return appResponse
  },
})

logger.info('server_started', {
  host: listenHost,
  port: listenPort,
  serverName: 'kanban-api',
  version: 'dev',
  mode: isProduction ? 'production' : 'development',
  staticRoot: isProduction ? staticRoot : undefined,
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
