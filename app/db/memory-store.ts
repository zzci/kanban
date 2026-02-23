import { ulid } from 'ulid'
import { DEFAULT_STATUSES, ISSUE_SEEDS, SEED_PROJECTS } from './seed-data'

// ---------- Types ----------

export interface Project {
  id: string
  name: string
  description?: string
  directory?: string
  repositoryUrl?: string
  createdAt: string
  updatedAt: string
}

export interface Status {
  id: string
  projectId: string
  name: string
  color: string
  sortOrder: number
}

export interface Issue {
  id: string
  projectId: string
  statusId: string
  issueNumber: number
  displayId: string
  title: string
  description: string | null
  priority: 'urgent' | 'high' | 'medium' | 'low'
  sortOrder: number
  parentIssueId: string | null
  useWorktree: boolean
  createdAt: string
  updatedAt: string
}

export interface Tag {
  id: string
  projectId: string
  name: string
  color: string
}

export interface IssueTag {
  id: string
  issueId: string
  tagId: string
}

// ---------- Storage ----------

const now = () => new Date().toISOString()

let projects: Project[] = SEED_PROJECTS.map(p => ({
  ...p,
  createdAt: now(),
  updatedAt: now(),
}))

let statuses: Status[] = SEED_PROJECTS.flatMap(p =>
  DEFAULT_STATUSES.map(s => ({ id: ulid(), projectId: p.id, ...s })),
)

// ---------- Seed issues per project ----------

function getStatusesForProject(projectId: string): Status[] {
  return statuses.filter(s => s.projectId === projectId).sort((a, b) => a.sortOrder - b.sortOrder)
}

let nextIssueNumber = 1

let issues: Issue[] = []
for (const proj of SEED_PROJECTS) {
  const projStatuses = getStatusesForProject(proj.id)
  const projIssues = ISSUE_SEEDS[proj.id] ?? []
  for (let i = 0; i < projIssues.length; i++) {
    const item = projIssues[i]!
    const issueNum = nextIssueNumber++
    issues.push({
      id: ulid(),
      projectId: proj.id,
      statusId: projStatuses[item.statusIndex]!.id,
      issueNumber: issueNum,
      displayId: `ISS-${issueNum}`,
      title: item.title,
      description: item.description,
      priority: item.priority,
      sortOrder: i,
      parentIssueId: null,
      useWorktree: false,
      createdAt: now(),
      updatedAt: now(),
    })
  }
}

let tags: Tag[] = SEED_PROJECTS.flatMap(p => [
  { id: ulid(), projectId: p.id, name: 'Bug', color: '#ef4444' },
  { id: ulid(), projectId: p.id, name: 'Feature', color: '#8b5cf6' },
  { id: ulid(), projectId: p.id, name: 'Docs', color: '#06b6d4' },
])

let issueTags: IssueTag[] = []

// ---------- Projects ----------

export function getProjects(): Project[] {
  return [...projects]
}

export function getProject(id: string): Project | undefined {
  return projects.find(p => p.id === id)
}

export function createProject(data: {
  name: string
  description?: string
  directory?: string
  repositoryUrl?: string
}): Project {
  const project: Project = {
    id: ulid(),
    name: data.name,
    description: data.description,
    directory: data.directory,
    repositoryUrl: data.repositoryUrl,
    createdAt: now(),
    updatedAt: now(),
  }
  projects = [...projects, project]

  // Auto-create default statuses (uses shared constant)
  for (const s of DEFAULT_STATUSES) {
    statuses = [...statuses, { id: ulid(), projectId: project.id, ...s }]
  }

  return project
}

export function updateProject(
  id: string,
  changes: Partial<Pick<Project, 'name' | 'description' | 'directory' | 'repositoryUrl'>>,
): Project | undefined {
  const idx = projects.findIndex(p => p.id === id)
  if (idx === -1)
    return undefined
  const updated = { ...projects[idx]!, ...changes, updatedAt: now() }
  projects = projects.map((p, i) => (i === idx ? updated : p))
  return updated
}

// ---------- Statuses ----------

export function getStatusesByProject(projectId: string): Status[] {
  return statuses.filter(s => s.projectId === projectId).sort((a, b) => a.sortOrder - b.sortOrder)
}

export function getStatus(id: string): Status | undefined {
  return statuses.find(s => s.id === id)
}

export function createStatus(projectId: string, data: { name: string, color: string }): Status {
  const maxOrder = statuses
    .filter(s => s.projectId === projectId)
    .reduce((max, s) => Math.max(max, s.sortOrder), -1)
  const status: Status = {
    id: ulid(),
    projectId,
    name: data.name,
    color: data.color,
    sortOrder: maxOrder + 1,
  }
  statuses = [...statuses, status]
  return status
}

export function updateStatus(
  id: string,
  changes: Partial<Pick<Status, 'name' | 'color' | 'sortOrder'>>,
): Status | undefined {
  const idx = statuses.findIndex(s => s.id === id)
  if (idx === -1)
    return undefined
  const updated = { ...statuses[idx]!, ...changes }
  statuses = statuses.map((s, i) => (i === idx ? updated : s))
  return updated
}

// ---------- Issues ----------

export function getIssuesByProject(projectId: string): Issue[] {
  return issues.filter(i => i.projectId === projectId)
}

export function getIssue(id: string): Issue | undefined {
  return issues.find(i => i.id === id)
}

export function createIssue(
  projectId: string,
  data: {
    title: string
    description?: string | null
    priority?: Issue['priority']
    statusId: string
    parentIssueId?: string | null
    useWorktree?: boolean
  },
): Issue {
  // Validate statusId belongs to the project
  const status = statuses.find(s => s.id === data.statusId && s.projectId === projectId)
  if (!status) {
    throw new Error(`Status '${data.statusId}' does not belong to project '${projectId}'`)
  }

  const issueNumber = nextIssueNumber++

  const maxOrder = issues
    .filter(i => i.projectId === projectId && i.statusId === data.statusId)
    .reduce((max, i) => Math.max(max, i.sortOrder), -1)

  const issue: Issue = {
    id: ulid(),
    projectId,
    statusId: data.statusId,
    issueNumber,
    displayId: `ISS-${issueNumber}`,
    title: data.title,
    description: data.description ?? null,
    priority: data.priority ?? 'medium',
    sortOrder: maxOrder + 1,
    parentIssueId: data.parentIssueId ?? null,
    useWorktree: data.useWorktree ?? false,
    createdAt: now(),
    updatedAt: now(),
  }
  issues = [...issues, issue]
  return issue
}

export function updateIssue(
  id: string,
  changes: Partial<
    Pick<Issue, 'title' | 'description' | 'priority' | 'statusId' | 'sortOrder' | 'parentIssueId'>
  >,
): Issue | undefined {
  const idx = issues.findIndex(i => i.id === id)
  if (idx === -1)
    return undefined
  const updated = { ...issues[idx]!, ...changes, updatedAt: now() }
  issues = issues.map((i, index) => (index === idx ? updated : i))
  return updated
}

export function bulkUpdateIssues(
  projectId: string,
  updates: Array<{ id: string, changes: Partial<Pick<Issue, 'statusId' | 'sortOrder'>> }>,
): Issue[] {
  // Filter to only include issues belonging to the project
  const projectIssueIds = new Set(
    issues.filter(i => i.projectId === projectId).map(i => i.id),
  )

  const result: Issue[] = []
  for (const { id, changes } of updates) {
    if (!projectIssueIds.has(id))
      continue
    const updated = updateIssue(id, changes)
    if (updated)
      result.push(updated)
  }
  return result
}

// ---------- Tags ----------

export function getTagsByProject(projectId: string): Tag[] {
  return tags.filter(t => t.projectId === projectId)
}

export function getTag(id: string): Tag | undefined {
  return tags.find(t => t.id === id)
}

export function createTag(projectId: string, data: { name: string, color: string }): Tag {
  const tag: Tag = { id: ulid(), projectId, name: data.name, color: data.color }
  tags = [...tags, tag]
  return tag
}

export function deleteTag(projectId: string, tagId: string): boolean {
  const tag = tags.find(t => t.id === tagId && t.projectId === projectId)
  if (!tag)
    return false
  tags = tags.filter(t => t.id !== tagId)
  issueTags = issueTags.filter(it => it.tagId !== tagId)
  return true
}

export function getIssueTagsByIssue(issueId: string): IssueTag[] {
  return issueTags.filter(it => it.issueId === issueId)
}

export function getTagsForIssue(issueId: string): Tag[] {
  const tagIds = issueTags.filter(it => it.issueId === issueId).map(it => it.tagId)
  return tags.filter(t => tagIds.includes(t.id))
}

export function addTagToIssue(issueId: string, tagId: string): IssueTag {
  const existing = issueTags.find(it => it.issueId === issueId && it.tagId === tagId)
  if (existing)
    return existing
  const issueTag: IssueTag = { id: ulid(), issueId, tagId }
  issueTags = [...issueTags, issueTag]
  return issueTag
}

export function removeTagFromIssue(issueId: string, tagId: string): boolean {
  const before = issueTags.length
  issueTags = issueTags.filter(it => !(it.issueId === issueId && it.tagId === tagId))
  return issueTags.length < before
}
