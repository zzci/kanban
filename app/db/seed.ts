import { and, eq } from 'drizzle-orm'
import { ulid } from 'ulid'
import { db } from '.'
import { issues, projects, statuses } from './schema'
import { DEFAULT_STATUSES, ISSUE_SEEDS, SEED_PROJECTS } from './seed-data'

export async function seedDefaultProject() {
  for (const proj of SEED_PROJECTS) {
    // Seed project
    const existingProject = await db.select().from(projects).where(eq(projects.id, proj.id))
    if (existingProject.length === 0) {
      await db.insert(projects).values({
        id: proj.id,
        name: proj.name,
        slug: proj.id,
      })
    }

    // Seed statuses
    const existingStatuses = await db
      .select()
      .from(statuses)
      .where(and(eq(statuses.projectId, proj.id), eq(statuses.isDeleted, 0)))
    if (existingStatuses.length === 0) {
      for (const s of DEFAULT_STATUSES) {
        await db.insert(statuses).values({
          id: ulid(),
          projectId: proj.id,
          name: s.name,
          color: s.color,
          sortOrder: s.sortOrder,
        })
      }
    }

    // Seed issues
    const existingIssues = await db.select().from(issues).where(eq(issues.projectId, proj.id))
    if (existingIssues.length === 0) {
      const projStatuses = await db
        .select()
        .from(statuses)
        .where(and(eq(statuses.projectId, proj.id), eq(statuses.isDeleted, 0)))
      const sortedStatuses = projStatuses.sort((a, b) => a.sortOrder - b.sortOrder)

      const projIssues = ISSUE_SEEDS[proj.id] ?? []
      let issueNumber = 1
      for (let i = 0; i < projIssues.length; i++) {
        const item = projIssues[i]!
        const status = sortedStatuses[item.statusIndex]
        if (!status)
          continue

        await db.insert(issues).values({
          id: ulid(),
          projectId: proj.id,
          statusId: status.id,
          issueNumber,
          displayId: `ISS-${issueNumber}`,
          title: item.title,
          description: item.description,
          priority: item.priority,
          sortOrder: i,
          parentIssueId: null,
          useWorktree: false,
        })
        issueNumber++
      }
    }
  }
}
