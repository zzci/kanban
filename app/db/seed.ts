import { eq } from 'drizzle-orm'
import { db } from '.'
import { projects } from './schema'

export async function seedDefaultProject() {
  const existing = await db.select().from(projects).where(eq(projects.id, 'default'))
  if (existing.length === 0) {
    await db.insert(projects).values({
      id: 'default',
      name: 'My Project',
    })
  }
}
