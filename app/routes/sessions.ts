import { resolve } from 'node:path'
import { Hono } from 'hono'
import { getExecutionProcessesBySession } from '../agents/agent-store'
import { sessionManager } from '../agents/session-manager'

const sessions = new Hono()

function getAllowedRoot(): string {
  return resolve(process.env.PROJECTS_ROOT ?? process.cwd())
}

function isWithinAllowedRoot(targetPath: string): boolean {
  const allowed = getAllowedRoot()
  const resolved = resolve(targetPath)
  return resolved === allowed || resolved.startsWith(`${allowed}/`)
}

// GET /api/projects/:projectId/sessions — List sessions
sessions.get('/', (c) => {
  const projectId = c.req.param('projectId')!
  const list = sessionManager.getSessionsByProject(projectId)
  return c.json({ success: true, data: list })
})

// POST /api/projects/:projectId/sessions — Create session
sessions.post('/', async (c) => {
  const projectId = c.req.param('projectId')!
  const body = await c.req.json<{
    agentType: string
    prompt: string
    issueId?: string
    workingDir?: string
    model?: string
  }>()

  if (!body.agentType || !body.prompt) {
    return c.json({ success: false, error: 'agentType and prompt are required' }, 400)
  }

  // SEC-003: Validate workingDir is within allowed root
  if (body.workingDir) {
    const resolvedDir = resolve(body.workingDir)
    if (!isWithinAllowedRoot(resolvedDir)) {
      return c.json({ success: false, error: 'workingDir is outside the allowed root' }, 400)
    }
  }

  const session = sessionManager.createSession({
    projectId,
    agentType: body.agentType as any,
    prompt: body.prompt,
    issueId: body.issueId,
    workingDir: body.workingDir,
    model: body.model,
  })

  return c.json({ success: true, data: session }, 201)
})

// GET /api/projects/:projectId/sessions/:id — Get session
sessions.get('/:id', (c) => {
  const id = c.req.param('id')
  const session = sessionManager.getSession(id)
  if (!session) {
    return c.json({ success: false, error: 'Session not found' }, 404)
  }
  return c.json({ success: true, data: session })
})

// POST /api/projects/:projectId/sessions/:id/execute — Execute session
sessions.post('/:id/execute', async (c) => {
  const id = c.req.param('id')
  try {
    const result = await sessionManager.executeSession(id)
    return c.json({
      success: true,
      data: { executionId: result.executionId, sessionId: id },
    })
  }
  catch (error) {
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Execution failed',
      },
      400,
    )
  }
})

// POST /api/projects/:projectId/sessions/:id/follow-up — Follow-up
sessions.post('/:id/follow-up', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json<{ prompt: string }>()

  if (!body.prompt) {
    return c.json({ success: false, error: 'prompt is required' }, 400)
  }

  try {
    const result = await sessionManager.followUpSession(id, body.prompt)
    return c.json({
      success: true,
      data: { executionId: result.executionId, sessionId: id },
    })
  }
  catch (error) {
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Follow-up failed',
      },
      400,
    )
  }
})

// POST /api/projects/:projectId/sessions/:id/cancel — Cancel
sessions.post('/:id/cancel', async (c) => {
  const id = c.req.param('id')
  try {
    await sessionManager.cancelSession(id)
    return c.json({ success: true, data: { sessionId: id, status: 'cancelled' } })
  }
  catch (error) {
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Cancel failed',
      },
      400,
    )
  }
})

// GET /api/projects/:projectId/sessions/:id/logs — Get logs
sessions.get('/:id/logs', (c) => {
  const id = c.req.param('id')
  const session = sessionManager.getSession(id)
  if (!session) {
    return c.json({ success: false, error: 'Session not found' }, 404)
  }

  // Get all execution processes for this session and their logs
  const processes = getExecutionProcessesBySession(id)
  const logs = processes.flatMap(p => sessionManager.getSessionLogs(p.id))

  return c.json({ success: true, data: { session, logs } })
})

export default sessions
