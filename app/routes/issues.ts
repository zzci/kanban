import { zValidator } from '@hono/zod-validator'
import { and, eq, max } from 'drizzle-orm'
import { Hono } from 'hono'
import { z } from 'zod'
import { db } from '../db'
import { findProject } from '../db/helpers'
import { issues as issuesTable, statuses as statusesTable } from '../db/schema'

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

type IssueRow = typeof issuesTable.$inferSelect

function serializeIssue(row: IssueRow) {
  return {
    id: row.id,
    projectId: row.projectId,
    statusId: row.statusId,
    issueNumber: row.issueNumber,
    displayId: row.displayId,
    title: row.title,
    description: row.description ?? null,
    priority: row.priority as 'urgent' | 'high' | 'medium' | 'low',
    sortOrder: row.sortOrder,
    parentIssueId: row.parentIssueId ?? null,
    useWorktree: row.useWorktree,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

const issues = new Hono()

issues.get('/', async (c) => {
  const projectId = c.req.param('projectId')!
  const project = await findProject(projectId)
  if (!project) {
    return c.json({ success: false, error: 'Project not found' }, 404)
  }

  const rows = await db
    .select()
    .from(issuesTable)
    .where(and(eq(issuesTable.projectId, project.id), eq(issuesTable.isDeleted, 0)))

  return c.json({ success: true, data: rows.map(serializeIssue) })
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
  async (c) => {
    const projectId = c.req.param('projectId')!
    const project = await findProject(projectId)
    if (!project) {
      return c.json({ success: false, error: 'Project not found' }, 404)
    }

    const body = c.req.valid('json')

    // Validate statusId belongs to project
    const [status] = await db
      .select()
      .from(statusesTable)
      .where(
        and(
          eq(statusesTable.id, body.statusId),
          eq(statusesTable.projectId, project.id),
          eq(statusesTable.isDeleted, 0),
        ),
      )
    if (!status) {
      return c.json(
        { success: false, error: `Status '${body.statusId}' does not belong to project '${projectId}'` },
        400,
      )
    }

    // Compute next issueNumber across ALL issues (including soft-deleted) to avoid reuse
    const [maxNumRow] = await db
      .select({ maxNum: max(issuesTable.issueNumber) })
      .from(issuesTable)
      .where(eq(issuesTable.projectId, project.id))
    const issueNumber = (maxNumRow?.maxNum ?? 0) + 1

    // Compute max sortOrder within the target status column
    const [maxOrderRow] = await db
      .select({ maxOrder: max(issuesTable.sortOrder) })
      .from(issuesTable)
      .where(
        and(
          eq(issuesTable.projectId, project.id),
          eq(issuesTable.statusId, body.statusId),
          eq(issuesTable.isDeleted, 0),
        ),
      )
    const sortOrder = (maxOrderRow?.maxOrder ?? -1) + 1

    try {
      const [row] = await db
        .insert(issuesTable)
        .values({
          projectId: project.id,
          statusId: body.statusId,
          issueNumber,
          displayId: `ISS-${issueNumber}`,
          title: body.title,
          description: body.description ?? null,
          priority: body.priority,
          sortOrder,
          parentIssueId: body.parentIssueId ?? null,
          useWorktree: body.useWorktree ?? false,
        })
        .returning()

      return c.json({ success: true, data: serializeIssue(row!) }, 201)
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
  async (c) => {
    const projectId = c.req.param('projectId')!
    const project = await findProject(projectId)
    if (!project) {
      return c.json({ success: false, error: 'Project not found' }, 404)
    }

    const body = c.req.valid('json')

    // Get all project issue IDs for ownership validation
    const projectIssues = await db
      .select({ id: issuesTable.id })
      .from(issuesTable)
      .where(and(eq(issuesTable.projectId, project.id), eq(issuesTable.isDeleted, 0)))
    const projectIssueIds = new Set(projectIssues.map(i => i.id))

    const updated: ReturnType<typeof serializeIssue>[] = []

    await db.transaction(async (tx) => {
      for (const u of body.updates) {
        if (!projectIssueIds.has(u.id))
          continue

        const changes: Record<string, unknown> = {}
        if (u.statusId !== undefined)
          changes.statusId = u.statusId
        if (u.sortOrder !== undefined)
          changes.sortOrder = u.sortOrder
        if (u.priority !== undefined)
          changes.priority = u.priority

        if (Object.keys(changes).length === 0)
          continue

        const [row] = await tx
          .update(issuesTable)
          .set(changes)
          .where(eq(issuesTable.id, u.id))
          .returning()
        if (row) {
          updated.push(serializeIssue(row))
        }
      }
    })

    return c.json({ success: true, data: updated })
  },
)

issues.get('/:id', async (c) => {
  const projectId = c.req.param('projectId')!
  const project = await findProject(projectId)
  if (!project) {
    return c.json({ success: false, error: 'Project not found' }, 404)
  }

  const issueId = c.req.param('id')!
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

  return c.json({ success: true, data: serializeIssue(issue) })
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
  async (c) => {
    const projectId = c.req.param('projectId')!
    const project = await findProject(projectId)
    if (!project) {
      return c.json({ success: false, error: 'Project not found' }, 404)
    }

    const issueId = c.req.param('id')!
    const [existing] = await db
      .select()
      .from(issuesTable)
      .where(
        and(
          eq(issuesTable.id, issueId),
          eq(issuesTable.projectId, project.id),
          eq(issuesTable.isDeleted, 0),
        ),
      )
    if (!existing) {
      return c.json({ success: false, error: 'Issue not found' }, 404)
    }

    const body = c.req.valid('json')
    const updates: Record<string, unknown> = {}
    if (body.title !== undefined)
      updates.title = body.title
    if (body.description !== undefined)
      updates.description = body.description
    if (body.priority !== undefined)
      updates.priority = body.priority
    if (body.statusId !== undefined)
      updates.statusId = body.statusId
    if (body.sortOrder !== undefined)
      updates.sortOrder = body.sortOrder
    if (body.parentIssueId !== undefined)
      updates.parentIssueId = body.parentIssueId

    if (Object.keys(updates).length === 0) {
      return c.json({ success: true, data: serializeIssue(existing) })
    }

    const [row] = await db
      .update(issuesTable)
      .set(updates)
      .where(eq(issuesTable.id, issueId))
      .returning()
    if (!row) {
      return c.json({ success: false, error: 'Issue not found' }, 404)
    }

    return c.json({ success: true, data: serializeIssue(row) })
  },
)

export default issues
