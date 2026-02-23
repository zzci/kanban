import { Hono } from 'hono'
import {
  bulkUpdateIssues,
  createIssue,
  getIssue,
  getIssuesByProject,
  getTagsForIssue,
  updateIssue,
} from '../db/memory-store'

const issues = new Hono()

issues.get('/', (c) => {
  const projectId = c.req.param('projectId')
  const allIssues = getIssuesByProject(projectId)
  const withTags = allIssues.map(issue => ({
    ...issue,
    tags: getTagsForIssue(issue.id),
  }))
  return c.json({ success: true, data: withTags })
})

issues.post('/', async (c) => {
  const projectId = c.req.param('projectId')
  const body = await c.req.json<{
    title?: string
    description?: string
    priority?: string
    statusId?: string
    useWorktree?: boolean
  }>()
  if (!body.title || !body.statusId) {
    return c.json({ success: false, error: 'title and statusId are required' }, 400)
  }
  const issue = createIssue(projectId, {
    title: body.title,
    description: body.description,
    priority: (body.priority as 'urgent' | 'high' | 'medium' | 'low') ?? 'medium',
    statusId: body.statusId,
    useWorktree: body.useWorktree ?? false,
  })
  return c.json({ success: true, data: { ...issue, tags: [] } }, 201)
})

issues.patch('/bulk', async (c) => {
  const body = await c.req.json<{
    updates?: Array<{ id: string, changes: { statusId?: string, sortOrder?: number } }>
  }>()
  if (!body.updates || !Array.isArray(body.updates)) {
    return c.json({ success: false, error: 'updates array is required' }, 400)
  }
  const updated = bulkUpdateIssues(body.updates)
  return c.json({ success: true, data: updated })
})

issues.get('/:id', (c) => {
  const issue = getIssue(c.req.param('id'))
  if (!issue) {
    return c.json({ success: false, error: 'Issue not found' }, 404)
  }
  return c.json({ success: true, data: { ...issue, tags: getTagsForIssue(issue.id) } })
})

issues.patch('/:id', async (c) => {
  const body = await c.req.json<{
    title?: string
    description?: string
    priority?: string
    statusId?: string
    sortOrder?: number
  }>()
  const updated = updateIssue(c.req.param('id'), body as Parameters<typeof updateIssue>[1])
  if (!updated) {
    return c.json({ success: false, error: 'Issue not found' }, 404)
  }
  return c.json({ success: true, data: { ...updated, tags: getTagsForIssue(updated.id) } })
})

export default issues
