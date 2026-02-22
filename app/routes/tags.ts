import { Hono } from 'hono'
import { addTagToIssue, createTag, getTagsByProject, removeTagFromIssue } from '../db/memory-store'

const tags = new Hono()

tags.get('/', (c) => {
  const projectId = c.req.param('projectId')
  return c.json({ success: true, data: getTagsByProject(projectId) })
})

tags.post('/', async (c) => {
  const projectId = c.req.param('projectId')
  const body = await c.req.json<{ name?: string, color?: string }>()
  if (!body.name || !body.color) {
    return c.json({ success: false, error: 'name and color are required' }, 400)
  }
  const tag = createTag(projectId, { name: body.name, color: body.color })
  return c.json({ success: true, data: tag }, 201)
})

// Issue-tag associations are nested under issues
const issueTagRoutes = new Hono()

issueTagRoutes.post('/', async (c) => {
  const issueId = c.req.param('issueId')
  const body = await c.req.json<{ tagId?: string }>()
  if (!body.tagId) {
    return c.json({ success: false, error: 'tagId is required' }, 400)
  }
  const issueTag = addTagToIssue(issueId, body.tagId)
  return c.json({ success: true, data: issueTag }, 201)
})

issueTagRoutes.delete('/:tagId', (c) => {
  const issueId = c.req.param('issueId')
  const tagId = c.req.param('tagId')
  const removed = removeTagFromIssue(issueId, tagId)
  if (!removed) {
    return c.json({ success: false, error: 'Association not found' }, 404)
  }
  return c.json({ success: true, data: null })
})

export default tags
export { issueTagRoutes }
