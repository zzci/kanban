import { zValidator } from '@hono/zod-validator'
import { and, eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { z } from 'zod'
import { db } from '../db'
import { findProject } from '../db/helpers'
import { issues as issuesTable, issueTags as issueTagsTable, tags as tagsTable } from '../db/schema'

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

type TagRow = typeof tagsTable.$inferSelect

function serializeTag(row: TagRow) {
  return {
    id: row.id,
    projectId: row.projectId,
    name: row.name,
    color: row.color,
  }
}

const tags = new Hono()

tags.get('/', async (c) => {
  const projectId = c.req.param('projectId')!
  const project = await findProject(projectId)
  if (!project) {
    return c.json({ success: false, error: 'Project not found' }, 404)
  }
  const rows = await db
    .select()
    .from(tagsTable)
    .where(and(eq(tagsTable.projectId, project.id), eq(tagsTable.isDeleted, 0)))
  return c.json({ success: true, data: rows.map(serializeTag) })
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
  async (c) => {
    const projectId = c.req.param('projectId')!
    const project = await findProject(projectId)
    if (!project) {
      return c.json({ success: false, error: 'Project not found' }, 404)
    }

    const body = c.req.valid('json')
    const [row] = await db
      .insert(tagsTable)
      .values({
        projectId: project.id,
        name: body.name,
        color: body.color ?? '#6b7280',
      })
      .returning()
    return c.json({ success: true, data: serializeTag(row!) }, 201)
  },
)

tags.delete('/:tagId', async (c) => {
  const projectId = c.req.param('projectId')!
  const project = await findProject(projectId)
  if (!project) {
    return c.json({ success: false, error: 'Project not found' }, 404)
  }

  const tagId = c.req.param('tagId')!
  // Verify tag belongs to project
  const [existing] = await db
    .select()
    .from(tagsTable)
    .where(
      and(
        eq(tagsTable.id, tagId),
        eq(tagsTable.projectId, project.id),
        eq(tagsTable.isDeleted, 0),
      ),
    )
  if (!existing) {
    return c.json({ success: false, error: 'Tag not found' }, 404)
  }

  // Soft-delete tag and all its issue associations in a transaction
  await db.transaction(async (tx) => {
    await tx
      .update(tagsTable)
      .set({ isDeleted: 1 })
      .where(eq(tagsTable.id, tagId))
    await tx
      .update(issueTagsTable)
      .set({ isDeleted: 1 })
      .where(and(eq(issueTagsTable.tagId, tagId), eq(issueTagsTable.isDeleted, 0)))
  })

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
  async (c) => {
    const projectId = c.req.param('projectId')!
    const issueId = c.req.param('issueId')!

    const project = await findProject(projectId)
    if (!project) {
      return c.json({ success: false, error: 'Project not found' }, 404)
    }

    // Verify issue belongs to project
    const [issue] = await db
      .select()
      .from(issuesTable)
      .where(
        and(
          eq(issuesTable.id, issueId),
          eq(issuesTable.projectId, project.id),
          eq(issuesTable.isDeleted, 0),
        ),
      )
    if (!issue) {
      return c.json({ success: false, error: 'Issue not found' }, 404)
    }

    const body = c.req.valid('json')

    // Verify tag belongs to project
    const [tag] = await db
      .select()
      .from(tagsTable)
      .where(
        and(
          eq(tagsTable.id, body.tagId),
          eq(tagsTable.projectId, project.id),
          eq(tagsTable.isDeleted, 0),
        ),
      )
    if (!tag) {
      return c.json({ success: false, error: 'Tag not found' }, 404)
    }

    // Check if already associated (idempotent)
    const [existingLink] = await db
      .select()
      .from(issueTagsTable)
      .where(
        and(
          eq(issueTagsTable.issueId, issueId),
          eq(issueTagsTable.tagId, body.tagId),
          eq(issueTagsTable.isDeleted, 0),
        ),
      )
    if (existingLink) {
      return c.json(
        { success: true, data: { id: existingLink.id, issueId: existingLink.issueId, tagId: existingLink.tagId } },
        201,
      )
    }

    const [row] = await db
      .insert(issueTagsTable)
      .values({ issueId, tagId: body.tagId })
      .returning()
    return c.json(
      { success: true, data: { id: row!.id, issueId: row!.issueId, tagId: row!.tagId } },
      201,
    )
  },
)

issueTagRoutes.delete('/:tagId', async (c) => {
  const projectId = c.req.param('projectId')!
  const issueId = c.req.param('issueId')!

  const project = await findProject(projectId)
  if (!project) {
    return c.json({ success: false, error: 'Project not found' }, 404)
  }

  // Verify issue belongs to project
  const [issue] = await db
    .select()
    .from(issuesTable)
    .where(
      and(
        eq(issuesTable.id, issueId),
        eq(issuesTable.projectId, project.id),
        eq(issuesTable.isDeleted, 0),
      ),
    )
  if (!issue) {
    return c.json({ success: false, error: 'Issue not found' }, 404)
  }

  const tagId = c.req.param('tagId')!
  // Soft-delete the association
  const [existing] = await db
    .select()
    .from(issueTagsTable)
    .where(
      and(
        eq(issueTagsTable.issueId, issueId),
        eq(issueTagsTable.tagId, tagId),
        eq(issueTagsTable.isDeleted, 0),
      ),
    )
  if (!existing) {
    return c.json({ success: false, error: 'Association not found' }, 404)
  }

  await db
    .update(issueTagsTable)
    .set({ isDeleted: 1 })
    .where(eq(issueTagsTable.id, existing.id))

  return c.json({ success: true, data: null })
})

export default tags
export { issueTagRoutes }
