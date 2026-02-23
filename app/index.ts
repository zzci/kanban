import app from './app'
import { logger } from './logger'

const listenHost = process.env.API_HOST ?? '0.0.0.0'
const listenPort = Number(process.env.API_PORT ?? 3000)
const isProduction = process.env.NODE_ENV === 'production'

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
  mode: isProduction ? 'production' : 'development',
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
