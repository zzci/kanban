import { zValidator } from '@hono/zod-validator'
import { and, eq, max } from 'drizzle-orm'
import { Hono } from 'hono'
import { z } from 'zod'
import { db } from '../db'
import { findProject } from '../db/helpers'
import { statuses as statusesTable } from '../db/schema'

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

type StatusRow = typeof statusesTable.$inferSelect

function serializeStatus(row: StatusRow) {
  return {
    id: row.id,
    projectId: row.projectId,
    name: row.name,
    color: row.color,
    sortOrder: row.sortOrder,
  }
}

const statuses = new Hono()

statuses.get('/', async (c) => {
  const projectId = c.req.param('projectId')!
  const project = await findProject(projectId)
  if (!project) {
    return c.json({ success: false, error: 'Project not found' }, 404)
  }
  const rows = await db
    .select()
    .from(statusesTable)
    .where(and(eq(statusesTable.projectId, project.id), eq(statusesTable.isDeleted, 0)))
    .orderBy(statusesTable.sortOrder)
  return c.json({ success: true, data: rows.map(serializeStatus) })
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
  async (c) => {
    const projectId = c.req.param('projectId')!
    const project = await findProject(projectId)
    if (!project) {
      return c.json({ success: false, error: 'Project not found' }, 404)
    }

    const body = c.req.valid('json')

    // Compute max sortOrder + 1
    const [maxRow] = await db
      .select({ maxOrder: max(statusesTable.sortOrder) })
      .from(statusesTable)
      .where(and(eq(statusesTable.projectId, project.id), eq(statusesTable.isDeleted, 0)))
    const nextOrder = (maxRow?.maxOrder ?? -1) + 1

    const [row] = await db
      .insert(statusesTable)
      .values({
        projectId: project.id,
        name: body.name,
        color: body.color,
        sortOrder: nextOrder,
      })
      .returning()
    return c.json({ success: true, data: serializeStatus(row!) }, 201)
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
  async (c) => {
    const projectId = c.req.param('projectId')!
    const project = await findProject(projectId)
    if (!project) {
      return c.json({ success: false, error: 'Project not found' }, 404)
    }

    const statusId = c.req.param('id')!
    // Verify status belongs to project
    const [existing] = await db
      .select()
      .from(statusesTable)
      .where(
        and(
          eq(statusesTable.id, statusId),
          eq(statusesTable.projectId, project.id),
          eq(statusesTable.isDeleted, 0),
        ),
      )
    if (!existing) {
      return c.json({ success: false, error: 'Status not found' }, 404)
    }

    const body = c.req.valid('json')
    const updates: Record<string, unknown> = {}
    if (body.name !== undefined)
      updates.name = body.name
    if (body.color !== undefined)
      updates.color = body.color
    if (body.sortOrder !== undefined)
      updates.sortOrder = body.sortOrder

    if (Object.keys(updates).length === 0) {
      return c.json({ success: true, data: serializeStatus(existing) })
    }

    const [row] = await db
      .update(statusesTable)
      .set(updates)
      .where(eq(statusesTable.id, statusId))
      .returning()
    if (!row) {
      return c.json({ success: false, error: 'Status not found' }, 404)
    }
    return c.json({ success: true, data: serializeStatus(row) })
  },
)

export default statuses
