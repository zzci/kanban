import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { z } from 'zod'
import { createStatus, getProject, getStatusesByProject, updateStatus } from '../db/memory-store'

const createStatusSchema = z.object({
  name: z.string().min(1).max(100),
  color: z.string().regex(/^#[0-9a-f]{6}$/i),
})

const updateStatusSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  color: z
    .string()
    .regex(/^#[0-9a-f]{6}$/i)
    .optional(),
  sortOrder: z.number().int().min(0).optional(),
})

const statuses = new Hono()

statuses.get('/', (c) => {
  const projectId = c.req.param('projectId')!
  const project = getProject(projectId)
  if (!project) {
    return c.json({ success: false, error: 'Project not found' }, 404)
  }
  return c.json({ success: true, data: getStatusesByProject(projectId) })
})

statuses.post(
  '/',
  zValidator('json', createStatusSchema, (result, c) => {
    if (!result.success) {
      return c.json(
        { success: false, error: result.error.issues.map(i => i.message).join(', ') },
        400,
      )
    }
  }),
  (c) => {
    const projectId = c.req.param('projectId')!
    const project = getProject(projectId)
    if (!project) {
      return c.json({ success: false, error: 'Project not found' }, 404)
    }

    const body = c.req.valid('json')
    const status = createStatus(projectId, { name: body.name, color: body.color })
    return c.json({ success: true, data: status }, 201)
  },
)

statuses.patch(
  '/:id',
  zValidator('json', updateStatusSchema, (result, c) => {
    if (!result.success) {
      return c.json(
        { success: false, error: result.error.issues.map(i => i.message).join(', ') },
        400,
      )
    }
  }),
  (c) => {
    const body = c.req.valid('json')
    const updated = updateStatus(c.req.param('id')!, body)
    if (!updated) {
      return c.json({ success: false, error: 'Status not found' }, 404)
    }
    return c.json({ success: true, data: updated })
  },
)

export default statuses
