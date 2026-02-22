import { Hono } from 'hono'
import { createProject, getProject, getProjects, updateProject } from '../db/memory-store'

const projects = new Hono()

projects.get('/', (c) => {
  return c.json({ success: true, data: getProjects() })
})

projects.post('/', async (c) => {
  const body = await c.req.json<{ name?: string, prefix?: string }>()
  if (!body.name || !body.prefix) {
    return c.json({ success: false, error: 'name and prefix are required' }, 400)
  }
  const project = createProject({ name: body.name, prefix: body.prefix })
  return c.json({ success: true, data: project }, 201)
})

projects.get('/:projectId', (c) => {
  const project = getProject(c.req.param('projectId'))
  if (!project) {
    return c.json({ success: false, error: 'Project not found' }, 404)
  }
  return c.json({ success: true, data: project })
})

projects.patch('/:projectId', async (c) => {
  const body = await c.req.json<{ name?: string, prefix?: string }>()
  const updated = updateProject(c.req.param('projectId'), body)
  if (!updated) {
    return c.json({ success: false, error: 'Project not found' }, 404)
  }
  return c.json({ success: true, data: updated })
})

export default projects
