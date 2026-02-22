import { Hono } from 'hono'
import { checkDbHealth } from '../db'
import issues from './issues'
import projects from './projects'
import statuses from './statuses'
import tags, { issueTagRoutes } from './tags'

const apiRoutes = new Hono()

// Kanban routes
apiRoutes.route('/projects', projects)
apiRoutes.route('/projects/:projectId/statuses', statuses)
apiRoutes.route('/projects/:projectId/issues', issues)
apiRoutes.route('/projects/:projectId/tags', tags)
apiRoutes.route('/projects/:projectId/issues/:issueId/tags', issueTagRoutes)

function detectRuntime() {
  const hasBunGlobal = typeof Bun !== 'undefined'
  const bunVersion = process.versions?.bun ?? null
  const nodeRelease = process.release?.name ?? null
  const nodeVersion = process.versions?.node ?? null
  const execPath = process.execPath ?? null

  if (hasBunGlobal || bunVersion) {
    return {
      runtime: 'bun' as const,
      confidence: 'high' as const,
      signals: {
        hasBunGlobal,
        bunVersion,
        nodeRelease,
        nodeVersion,
        execPath,
      },
    }
  }

  if (nodeRelease === 'node' || nodeVersion) {
    return {
      runtime: 'node' as const,
      confidence: 'high' as const,
      signals: {
        hasBunGlobal,
        bunVersion,
        nodeRelease,
        nodeVersion,
        execPath,
      },
    }
  }

  return {
    runtime: 'unknown' as const,
    confidence: 'low' as const,
    signals: {
      hasBunGlobal,
      bunVersion,
      nodeRelease,
      nodeVersion,
      execPath,
    },
  }
}

function getRuntimeInfo() {
  const detected = detectRuntime()

  return {
    runtime: detected.runtime,
    confidence: detected.confidence,
    isBun: detected.runtime === 'bun',
    isNode: detected.runtime === 'node',
    signals: detected.signals,
    versions: {
      bun: process.versions?.bun ?? null,
      node: process.versions?.node ?? null,
      v8: process.versions?.v8 ?? null,
      uv: process.versions?.uv ?? null,
    },
    process: {
      pid: process.pid,
      ppid: process.ppid,
      title: process.title,
      argv: process.argv,
      execPath: process.execPath,
      cwd: process.cwd(),
      uptimeSeconds: process.uptime(),
      platform: process.platform,
      arch: process.arch,
      env: {
        NODE_ENV: process.env.NODE_ENV ?? null,
        API_HOST: process.env.API_HOST ?? null,
        API_PORT: process.env.API_PORT ?? null,
      },
    },
    timestamp: new Date().toISOString(),
  }
}

apiRoutes.get('/', (c) => {
  return c.json({
    name: 'kanban-api',
    status: 'ok',
    routes: ['GET /api', 'GET /api/health', 'GET /api/runtime'],
  })
})

apiRoutes.get('/health', async (c) => {
  const dbHealth = await checkDbHealth()
  return c.json({
    status: 'ok',
    db: dbHealth.ok ? 'ok' : 'error',
    timestamp: new Date().toISOString(),
  })
})

apiRoutes.get('/runtime', (c) => {
  return c.json(getRuntimeInfo())
})

export default apiRoutes
