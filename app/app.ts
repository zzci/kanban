import { Hono } from 'hono'
import { compress } from 'hono/compress'
import { cors } from 'hono/cors'
import { secureHeaders } from 'hono/secure-headers'
import { logger } from './logger'
import { agentRoutes, apiRoutes, sessionRoutes } from './routes'

const app = new Hono()

// --- Security headers ---
app.use(secureHeaders())

// --- CORS ---
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN ?? '*',
}))

// --- Compression ---
app.use(compress())

// --- SEC-001: API key authentication middleware ---
app.use('/api/*', async (c, next) => {
  const apiSecret = process.env.API_SECRET

  // Dev mode: if API_SECRET is not set, skip auth
  if (!apiSecret) {
    return next()
  }

  // Exempt health endpoint from auth
  const path = new URL(c.req.url).pathname
  if (path === '/api/health') {
    return next()
  }

  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, error: 'Unauthorized' }, 401)
  }

  const token = authHeader.slice(7)
  if (token !== apiSecret) {
    return c.json({ success: false, error: 'Unauthorized' }, 401)
  }

  return next()
})

// --- SEC-005: Rate limiting for session execute endpoint ---
const rateLimitStore = new Map<string, { count: number, resetAt: number }>()

const RATE_LIMIT_WINDOW_MS = 60_000 // 1 minute
const RATE_LIMIT_MAX = 10 // 10 requests per window

app.use('/api/projects/:projectId/sessions/:id/execute', async (c, next) => {
  const ip = c.req.header('x-forwarded-for')
    ?? c.req.header('x-real-ip')
    ?? 'unknown'

  const now = Date.now()
  const entry = rateLimitStore.get(ip)

  if (!entry || now >= entry.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return next()
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return c.json({ success: false, error: 'Too many requests' }, 429)
  }

  entry.count++
  return next()
})

// Periodically clean up stale rate limit entries (every 5 minutes)
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore) {
    if (now >= entry.resetAt) {
      rateLimitStore.delete(key)
    }
  }
}, 5 * 60_000)

// --- Routes ---
app.route('/api', apiRoutes)
app.route('/api/agents', agentRoutes)
app.route('/api/projects/:projectId/sessions', sessionRoutes)

// --- 404 handler ---
app.all('/api/*', (c) => {
  return c.json(
    { success: false, error: 'Not Found' },
    404,
  )
})

// --- API-002: Global error handler ---
app.onError((err, c) => {
  // Log the error
  logger.error('Unhandled error', {
    message: err.message,
    stack: err.stack,
    path: c.req.path,
    method: c.req.method,
  })

  // JSON parse errors
  if (err instanceof SyntaxError && err.message.includes('JSON')) {
    return c.json({ success: false, error: 'Invalid JSON' }, 400)
  }

  // All other errors
  return c.json({ success: false, error: 'Internal server error' }, 500)
})

export default app
