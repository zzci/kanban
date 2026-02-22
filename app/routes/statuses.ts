import { Hono } from 'hono'
import { createStatus, getStatusesByProject, updateStatus } from '../db/memory-store'

const statuses = new Hono()

statuses.get('/', (c) => {
  const projectId = c.req.param('projectId')
  return c.json({ success: true, data: getStatusesByProject(projectId) })
})

statuses.post('/', async (c) => {
  const projectId = c.req.param('projectId')
  const body = await c.req.json<{ name?: string, color?: string }>()
  if (!body.name || !body.color) {
    return c.json({ success: false, error: 'name and color are required' }, 400)
  }
  const status = createStatus(projectId, { name: body.name, color: body.color })
  return c.json({ success: true, data: status }, 201)
})

statuses.patch('/:id', async (c) => {
  const body = await c.req.json<{ name?: string, color?: string, sortOrder?: number }>()
  const updated = updateStatus(c.req.param('id'), body)
  if (!updated) {
    return c.json({ success: false, error: 'Status not found' }, 404)
  }
  return c.json({ success: true, data: updated })
})

export default statuses
