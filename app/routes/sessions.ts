import { stat } from 'node:fs/promises'
import { resolve } from 'node:path'
import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { streamSSE } from 'hono/streaming'
import { z } from 'zod'
import { getAgentSessionsByIssue, getExecutionProcessesBySession } from '../agents/agent-store'
import { processManager } from '../agents/process-manager'
import { sessionManager } from '../agents/session-manager'
import { findProject } from '../db/helpers'

const createSessionSchema = z.object({
  agentType: z.enum(['claude-code', 'codex', 'gemini']),
  prompt: z.string().min(1).max(32768),
  issueId: z.string().optional(),
  name: z.string().max(200).optional(),
  workingDir: z.string().max(1000).optional(),
  model: z
    .string()
    .regex(/^[\w.-]{1,100}$/)
    .optional(),
})

const followUpSchema = z.object({
  prompt: z.string().min(1).max(32768),
})

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
  const issueId = c.req.query('issueId')
  const list = issueId
    ? getAgentSessionsByIssue(projectId, issueId)
    : sessionManager.getSessionsByProject(projectId)
  return c.json({ success: true, data: list })
})

// POST /api/projects/:projectId/sessions — Create session
sessions.post(
  '/',
  zValidator('json', createSessionSchema, (result, c) => {
    if (!result.success) {
      return c.json(
        { success: false, error: result.error.issues.map(i => i.message).join(', ') },
        400,
      )
    }
  }),
  async (c) => {
    const projectId = c.req.param('projectId')!
    const body = c.req.valid('json')

    // Resolve workingDir: explicit > project.directory > cwd
    let workingDir = body.workingDir
    if (!workingDir) {
      const project = await findProject(projectId)
      if (project?.directory)
        workingDir = project.directory
    }

    // SEC-003: Validate workingDir is within allowed root
    if (workingDir) {
      const resolvedDir = resolve(workingDir)
      if (!isWithinAllowedRoot(resolvedDir)) {
        return c.json({ success: false, error: 'workingDir is outside the allowed root' }, 400)
      }
      try {
        const s = await stat(resolvedDir)
        if (!s.isDirectory()) {
          return c.json({ success: false, error: 'workingDir is not a directory' }, 400)
        }
      }
      catch {
        return c.json({ success: false, error: `Directory does not exist: ${resolvedDir}` }, 400)
      }
    }

    const session = sessionManager.createSession({
      projectId,
      agentType: body.agentType,
      prompt: body.prompt,
      issueId: body.issueId,
      name: body.name,
      workingDir,
      model: body.model,
    })

    return c.json({ success: true, data: session }, 201)
  },
)

// GET /api/projects/:projectId/sessions/:id/stream — SSE stream
sessions.get('/:id/stream', (c) => {
  const id = c.req.param('id')
  const session = sessionManager.getSession(id)
  if (!session) {
    return c.json({ success: false, error: 'Session not found' }, 404)
  }

  return streamSSE(c, async (stream) => {
    let done = false
    let resolveDone: (() => void) | undefined
    const donePromise = new Promise<void>((r) => {
      resolveDone = r
    })
    const TERMINAL_STATES = new Set(['completed', 'failed', 'cancelled'])

    const stop = () => {
      if (!done) {
        done = true
        resolveDone?.()
      }
    }

    const writeEvent = (event: string, data: unknown) => {
      if (done)
        return
      stream.writeSSE({ event, data: JSON.stringify(data) }).catch(stop)
    }

    // Buffer for events arriving during replay
    const buffer: Array<{ event: string, data: unknown }> = []
    let replaying = true

    // Subscribe BEFORE replay to avoid race conditions
    const unsubLog = processManager.onLog((executionId, entry) => {
      const proc = processManager.getProcess(executionId)
      if (proc?.sessionId !== id)
        return
      if (replaying) {
        buffer.push({ event: 'log', data: entry })
      }
      else {
        writeEvent('log', entry)
      }
    })

    const unsubState = processManager.onStateChange((executionId, state) => {
      const proc = processManager.getProcess(executionId)
      if (proc?.sessionId !== id)
        return
      if (replaying) {
        buffer.push({ event: 'state', data: { executionId, state, sessionId: id } })
      }
      else {
        writeEvent('state', { executionId, state, sessionId: id })
      }
      if (TERMINAL_STATES.has(state)) {
        writeEvent('done', { sessionId: id, finalStatus: state })
        stop()
      }
    })

    // Replay buffered logs
    const processes = getExecutionProcessesBySession(id)
    for (const proc of processes) {
      const logs = processManager.getLogs(proc.id)
      for (const entry of logs) {
        writeEvent('log', entry)
      }
    }

    // Flush buffer and switch to live mode
    replaying = false
    for (const evt of buffer) {
      writeEvent(evt.event, evt.data)
    }

    // If session already in terminal state, send done and close
    if (TERMINAL_STATES.has(session.status)) {
      writeEvent('done', { sessionId: id, finalStatus: session.status })
      unsubLog()
      unsubState()
      return
    }

    // Heartbeat every 15s
    const heartbeat = setInterval(() => {
      if (done)
        return
      writeEvent('heartbeat', { timestamp: new Date().toISOString() })
    }, 15_000)

    // Wait until stream ends (terminal state or client disconnect)
    try {
      await donePromise
    }
    finally {
      clearInterval(heartbeat)
      unsubLog()
      unsubState()
    }
  })
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
sessions.post(
  '/:id/follow-up',
  zValidator('json', followUpSchema, (result, c) => {
    if (!result.success) {
      return c.json(
        { success: false, error: result.error.issues.map(i => i.message).join(', ') },
        400,
      )
    }
  }),
  async (c) => {
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
  },
)

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
