import { and, eq } from 'drizzle-orm'
import { db } from '.'
import { projects as projectsTable } from './schema'

export async function findProject(param: string) {
  // Try by ID first, then by slug
  let [row] = await db
    .select()
    .from(projectsTable)
    .where(and(eq(projectsTable.id, param), eq(projectsTable.isDeleted, 0)))
  if (!row) {
    ;[row] = await db
      .select()
      .from(projectsTable)
      .where(and(eq(projectsTable.slug, param), eq(projectsTable.isDeleted, 0)))
  }
  return row
}
