import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { z } from 'zod'
import {
  addTagToIssue,
  createTag,
  deleteTag,
  getIssue,
  getProject,
  getTag,
  getTagsByProject,
  removeTagFromIssue,
} from '../db/memory-store'

const createTagSchema = z.object({
  name: z.string().min(1).max(100),
  color: z
    .string()
    .regex(/^#[0-9a-f]{6}$/i)
    .optional(),
})

const addTagToIssueSchema = z.object({
  tagId: z.string().min(1),
})

const tags = new Hono()

tags.get('/', (c) => {
  const projectId = c.req.param('projectId')!
  const project = getProject(projectId)
  if (!project) {
    return c.json({ success: false, error: 'Project not found' }, 404)
  }
  return c.json({ success: true, data: getTagsByProject(projectId) })
})

tags.post(
  '/',
  zValidator('json', createTagSchema, (result, c) => {
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
    const tag = createTag(projectId, { name: body.name, color: body.color ?? '#6b7280' })
    return c.json({ success: true, data: tag }, 201)
  },
)

tags.delete('/:tagId', (c) => {
  const projectId = c.req.param('projectId')!
  const project = getProject(projectId)
  if (!project) {
    return c.json({ success: false, error: 'Project not found' }, 404)
  }

  const tagId = c.req.param('tagId')!
  const removed = deleteTag(projectId, tagId)
  if (!removed) {
    return c.json({ success: false, error: 'Tag not found' }, 404)
  }
  return c.json({ success: true, data: null })
})

// Issue-tag associations are nested under issues
const issueTagRoutes = new Hono()

issueTagRoutes.post(
  '/',
  zValidator('json', addTagToIssueSchema, (result, c) => {
    if (!result.success) {
      return c.json(
        { success: false, error: result.error.issues.map(i => i.message).join(', ') },
        400,
      )
    }
  }),
  (c) => {
    const projectId = c.req.param('projectId')!
    const issueId = c.req.param('issueId')!

    // Verify issue belongs to project
    const issue = getIssue(issueId)
    if (!issue || issue.projectId !== projectId) {
      return c.json({ success: false, error: 'Issue not found' }, 404)
    }

    const body = c.req.valid('json')

    // Verify tag belongs to project
    const tag = getTag(body.tagId)
    if (!tag || tag.projectId !== projectId) {
      return c.json({ success: false, error: 'Tag not found' }, 404)
    }

    const issueTag = addTagToIssue(issueId, body.tagId)
    return c.json({ success: true, data: issueTag }, 201)
  },
)

issueTagRoutes.delete('/:tagId', (c) => {
  const projectId = c.req.param('projectId')!
  const issueId = c.req.param('issueId')!

  // Verify issue belongs to project
  const issue = getIssue(issueId)
  if (!issue || issue.projectId !== projectId) {
    return c.json({ success: false, error: 'Issue not found' }, 404)
  }

  const tagId = c.req.param('tagId')!
  const removed = removeTagFromIssue(issueId, tagId)
  if (!removed) {
    return c.json({ success: false, error: 'Association not found' }, 404)
  }
  return c.json({ success: true, data: null })
})

export default tags
export { issueTagRoutes }
