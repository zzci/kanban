import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { z } from 'zod'
import { getExecutionProcessesBySession } from '../agents/agent-store'
import { sessionManager } from '../agents/session-manager'

const createSessionSchema = z.object({
  agentType: z.enum(['claude-code', 'codex', 'gemini']),
  prompt: z.string().min(1).max(32768),
  issueId: z.string().optional(),
  workingDir: z.string().max(1000).optional(),
  model: z.string().regex(/^[\w.-]{1,100}$/).optional(),
})

const followUpSchema = z.object({
  prompt: z.string().min(1).max(32768),
})

const sessions = new Hono()

// GET /api/projects/:projectId/sessions — List sessions
sessions.get('/', (c) => {
  const projectId = c.req.param('projectId')!
  const list = sessionManager.getSessionsByProject(projectId)
  return c.json({ success: true, data: list })
})

// POST /api/projects/:projectId/sessions — Create session
sessions.post('/', zValidator('json', createSessionSchema, (result, c) => {
  if (!result.success) {
    return c.json({ success: false, error: result.error.issues.map(i => i.message).join(', ') }, 400)
  }
}), (c) => {
  const projectId = c.req.param('projectId')!
  const body = c.req.valid('json')

  const session = sessionManager.createSession({
    projectId,
    agentType: body.agentType,
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
sessions.post('/:id/follow-up', zValidator('json', followUpSchema, (result, c) => {
  if (!result.success) {
    return c.json({ success: false, error: result.error.issues.map(i => i.message).join(', ') }, 400)
  }
}), async (c) => {
  const id = c.req.param('id')
  const body = c.req.valid('json')

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
