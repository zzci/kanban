import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { z } from 'zod'
import { createProject, getProject, getProjects, updateProject } from '../db/memory-store'

const createProjectSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  directory: z.string().max(1000).optional(),
  repositoryUrl: z.string().url().optional().or(z.literal('')),
})

const updateProjectSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  directory: z.string().max(1000).optional(),
  repositoryUrl: z.string().url().optional().or(z.literal('')),
})

const projects = new Hono()

projects.get('/', (c) => {
  return c.json({ success: true, data: getProjects() })
})

projects.post('/', zValidator('json', createProjectSchema, (result, c) => {
  if (!result.success) {
    return c.json({ success: false, error: result.error.issues.map(i => i.message).join(', ') }, 400)
  }
}), (c) => {
  const body = c.req.valid('json')
  const project = createProject({
    name: body.name,
    description: body.description,
    directory: body.directory,
    repositoryUrl: body.repositoryUrl || undefined,
  })
  return c.json({ success: true, data: project }, 201)
})

projects.get('/:projectId', (c) => {
  const project = getProject(c.req.param('projectId'))
  if (!project) {
    return c.json({ success: false, error: 'Project not found' }, 404)
  }
  return c.json({ success: true, data: project })
})

projects.patch('/:projectId', zValidator('json', updateProjectSchema, (result, c) => {
  if (!result.success) {
    return c.json({ success: false, error: result.error.issues.map(i => i.message).join(', ') }, 400)
  }
}), (c) => {
  const body = c.req.valid('json')
  const updated = updateProject(c.req.param('projectId'), {
    ...body,
    repositoryUrl: body.repositoryUrl === '' ? undefined : body.repositoryUrl,
  })
  if (!updated) {
    return c.json({ success: false, error: 'Project not found' }, 404)
  }
  return c.json({ success: true, data: updated })
})

export default projects
