import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { z } from 'zod'
import {
  bulkUpdateIssues,
  createIssue,
  getIssue,
  getIssuesByProject,
  getProject,
  getTagsForIssue,
  updateIssue,
} from '../db/memory-store'

const priorityEnum = z.enum(['urgent', 'high', 'medium', 'low'])

const createIssueSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().max(50000).nullable().optional(),
  priority: priorityEnum.default('medium'),
  statusId: z.string().min(1),
  parentIssueId: z.string().optional(),
  useWorktree: z.boolean().optional(),
})

const bulkUpdateSchema = z.object({
  updates: z.array(
    z.object({
      id: z.string(),
      statusId: z.string().optional(),
      sortOrder: z.number().optional(),
      priority: priorityEnum.optional(),
    }),
  ),
})

const updateIssueSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(50000).nullable().optional(),
  priority: priorityEnum.optional(),
  statusId: z.string().optional(),
  sortOrder: z.number().optional(),
  parentIssueId: z.string().nullable().optional(),
})

const issues = new Hono()

issues.get('/', (c) => {
  const projectId = c.req.param('projectId')!
  const project = getProject(projectId)
  if (!project) {
    return c.json({ success: false, error: 'Project not found' }, 404)
  }
  const allIssues = getIssuesByProject(projectId)
  const withTags = allIssues.map(issue => ({
    ...issue,
    tags: getTagsForIssue(issue.id),
  }))
  return c.json({ success: true, data: withTags })
})

issues.post(
  '/',
  zValidator('json', createIssueSchema, (result, c) => {
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
    try {
      const issue = createIssue(projectId, {
        title: body.title,
        description: body.description,
        priority: body.priority,
        statusId: body.statusId,
        parentIssueId: body.parentIssueId,
        useWorktree: body.useWorktree ?? false,
      })
      return c.json({ success: true, data: { ...issue, tags: [] } }, 201)
    }
    catch (error) {
      return c.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to create issue',
        },
        400,
      )
    }
  },
)

issues.patch(
  '/bulk',
  zValidator('json', bulkUpdateSchema, (result, c) => {
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

    // Transform flat updates to the shape bulkUpdateIssues expects
    const updates = body.updates.map(u => ({
      id: u.id,
      changes: {
        ...(u.statusId !== undefined ? { statusId: u.statusId } : {}),
        ...(u.sortOrder !== undefined ? { sortOrder: u.sortOrder } : {}),
      },
    }))

    const updated = bulkUpdateIssues(projectId, updates)
    return c.json({ success: true, data: updated })
  },
)

issues.get('/:id', (c) => {
  const projectId = c.req.param('projectId')!
  const project = getProject(projectId)
  if (!project) {
    return c.json({ success: false, error: 'Project not found' }, 404)
  }

  const issue = getIssue(c.req.param('id')!)
  if (!issue || issue.projectId !== projectId) {
    return c.json({ success: false, error: 'Issue not found' }, 404)
  }
  return c.json({ success: true, data: { ...issue, tags: getTagsForIssue(issue.id) } })
})

issues.patch(
  '/:id',
  zValidator('json', updateIssueSchema, (result, c) => {
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

    const existing = getIssue(c.req.param('id')!)
    if (!existing || existing.projectId !== projectId) {
      return c.json({ success: false, error: 'Issue not found' }, 404)
    }

    const body = c.req.valid('json')
    const updated = updateIssue(c.req.param('id')!, body)
    if (!updated) {
      return c.json({ success: false, error: 'Issue not found' }, 404)
    }
    return c.json({ success: true, data: { ...updated, tags: getTagsForIssue(updated.id) } })
  },
)

export default issues
