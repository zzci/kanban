import { zValidator } from '@hono/zod-validator'
import { eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { z } from 'zod'
import { db } from '../db'
import { findProject } from '../db/helpers'
import { projects as projectsTable, statuses as statusesTable } from '../db/schema'
import { DEFAULT_STATUSES } from '../db/seed-data'

const slugRegex = /^[a-z0-9-]+$/

const createProjectSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(slugRegex).optional(),
  description: z.string().max(5000).optional(),
  directory: z.string().max(1000).optional(),
  repositoryUrl: z.string().url().optional().or(z.literal('')),
})

const updateProjectSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  slug: z.string().min(1).max(200).regex(slugRegex).optional(),
  description: z.string().max(5000).optional(),
  directory: z.string().max(1000).optional(),
  repositoryUrl: z.string().url().optional().or(z.literal('')),
})

type ProjectRow = typeof projectsTable.$inferSelect

function serializeProject(row: ProjectRow) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? undefined,
    directory: row.directory ?? undefined,
    repositoryUrl: row.repositoryUrl ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

function generateSlug(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9\u4E00-\u9FFF]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'project'
  )
}

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  let candidate = base
  let suffix = 2
  for (;;) {
    const [existing] = await db
      .select({ id: projectsTable.id })
      .from(projectsTable)
      .where(eq(projectsTable.slug, candidate))
    if (!existing || (excludeId && existing.id === excludeId)) {
      return candidate
    }
    candidate = `${base}-${suffix}`
    suffix++
  }
}

const projects = new Hono()

projects.get('/', async (c) => {
  const rows = await db.select().from(projectsTable).where(eq(projectsTable.isDeleted, 0))
  return c.json({ success: true, data: rows.map(serializeProject) })
})

projects.post(
  '/',
  zValidator('json', createProjectSchema, (result, c) => {
    if (!result.success) {
      return c.json(
        { success: false, error: result.error.issues.map(i => i.message).join(', ') },
        400,
      )
    }
  }),
  async (c) => {
    const body = c.req.valid('json')
    const slug = await uniqueSlug(body.slug ?? generateSlug(body.name))
    const [row] = await db
      .insert(projectsTable)
      .values({
        name: body.name,
        slug,
        description: body.description ?? null,
        directory: body.directory ?? null,
        repositoryUrl: body.repositoryUrl || null,
      })
      .returning()

    // Auto-create default statuses for new project
    for (const s of DEFAULT_STATUSES) {
      await db.insert(statusesTable).values({
        projectId: row!.id,
        name: s.name,
        color: s.color,
        sortOrder: s.sortOrder,
      })
    }

    return c.json({ success: true, data: serializeProject(row!) }, 201)
  },
)

projects.get('/:projectId', async (c) => {
  const row = await findProject(c.req.param('projectId'))
  if (!row) {
    return c.json({ success: false, error: 'Project not found' }, 404)
  }
  return c.json({ success: true, data: serializeProject(row) })
})

projects.patch(
  '/:projectId',
  zValidator('json', updateProjectSchema, (result, c) => {
    if (!result.success) {
      return c.json(
        { success: false, error: result.error.issues.map(i => i.message).join(', ') },
        400,
      )
    }
  }),
  async (c) => {
    const body = c.req.valid('json')
    const existing = await findProject(c.req.param('projectId'))
    if (!existing) {
      return c.json({ success: false, error: 'Project not found' }, 404)
    }

    const updates: Record<string, unknown> = {}
    if (body.name !== undefined)
      updates.name = body.name
    if (body.slug !== undefined) {
      const newSlug = await uniqueSlug(body.slug, existing.id)
      updates.slug = newSlug
    }
    if (body.description !== undefined)
      updates.description = body.description
    if (body.directory !== undefined)
      updates.directory = body.directory
    if (body.repositoryUrl !== undefined) {
      updates.repositoryUrl = body.repositoryUrl === '' ? null : body.repositoryUrl
    }

    if (Object.keys(updates).length === 0) {
      return c.json({ success: true, data: serializeProject(existing) })
    }

    const [row] = await db
      .update(projectsTable)
      .set(updates)
      .where(eq(projectsTable.id, existing.id))
      .returning()
    if (!row) {
      return c.json({ success: false, error: 'Project not found' }, 404)
    }
    return c.json({ success: true, data: serializeProject(row) })
  },
)

export default projects
