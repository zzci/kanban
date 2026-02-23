import { ulid } from 'ulid'

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

const DEFAULT_PROJECT_ID = 'default'

// ---------- Seed projects ----------

const SEED_PROJECTS: Array<{ id: string, name: string }> = [
  { id: DEFAULT_PROJECT_ID, name: 'My Project' },
  { id: 'frontend', name: 'Frontend App' },
  { id: 'backend', name: 'Backend API' },
  { id: 'mobile', name: 'Mobile App' },
]

let projects: Project[] = SEED_PROJECTS.map(p => ({
  ...p,
  createdAt: now(),
  updatedAt: now(),
}))

const DEFAULT_STATUSES = [
  { name: 'To Do', color: '#6b7280', sortOrder: 0 },
  { name: 'In Progress', color: '#3b82f6', sortOrder: 1 },
  { name: 'In Review', color: '#f59e0b', sortOrder: 2 },
  { name: 'Done', color: '#22c55e', sortOrder: 3 },
]

let statuses: Status[] = SEED_PROJECTS.flatMap(p =>
  DEFAULT_STATUSES.map(s => ({ id: ulid(), projectId: p.id, ...s })),
)

// ---------- Seed issues per project ----------

const ISSUE_SEEDS: Record<
  string,
  Array<{
    title: string
    description: string | null
    priority: Issue['priority']
    statusIndex: number
  }>
> = {
  default: [
    {
      title: 'Set up project repository',
      description: 'Initialize Git repo with README and license',
      priority: 'high',
      statusIndex: 3,
    },
    {
      title: 'Design database schema',
      description: 'Define tables for projects, issues, and tags',
      priority: 'high',
      statusIndex: 3,
    },
    {
      title: 'Implement authentication',
      description: 'Add JWT-based auth with login and signup',
      priority: 'urgent',
      statusIndex: 1,
    },
    {
      title: 'Create API endpoints',
      description: 'REST endpoints for CRUD operations',
      priority: 'high',
      statusIndex: 2,
    },
    {
      title: 'Build kanban board UI',
      description: 'Drag-and-drop board with columns and cards',
      priority: 'high',
      statusIndex: 1,
    },
    {
      title: 'Add search functionality',
      description: 'Full-text search across issues',
      priority: 'medium',
      statusIndex: 0,
    },
    { title: 'Implement notifications', description: null, priority: 'low', statusIndex: 0 },
    {
      title: 'Write unit tests',
      description: 'Cover core business logic with tests',
      priority: 'medium',
      statusIndex: 0,
    },
    {
      title: 'Set up CI/CD pipeline',
      description: 'GitHub Actions for lint, test, and deploy',
      priority: 'medium',
      statusIndex: 0,
    },
    {
      title: 'Add dark mode support',
      description: 'Theme toggle with system preference detection',
      priority: 'low',
      statusIndex: 0,
    },
    {
      title: 'Implement user roles',
      description: 'Admin, member, viewer permission levels',
      priority: 'high',
      statusIndex: 1,
    },
    {
      title: 'Add file attachment support',
      description: 'Upload images and documents to issues',
      priority: 'medium',
      statusIndex: 0,
    },
    {
      title: 'Build activity timeline',
      description: 'Log all changes with timestamps',
      priority: 'medium',
      statusIndex: 0,
    },
    {
      title: 'Add issue comments',
      description: 'Threaded comments with mentions',
      priority: 'high',
      statusIndex: 2,
    },
    {
      title: 'Implement webhooks',
      description: 'Notify external services on issue changes',
      priority: 'low',
      statusIndex: 0,
    },
    {
      title: 'Export to CSV',
      description: 'Download filtered issues as spreadsheet',
      priority: 'low',
      statusIndex: 0,
    },
  ],
  frontend: [
    {
      title: 'Setup Vite + React project',
      description: 'Initialize with TypeScript template',
      priority: 'high',
      statusIndex: 3,
    },
    {
      title: 'Configure Tailwind CSS v4',
      description: 'Install and setup PostCSS pipeline',
      priority: 'high',
      statusIndex: 3,
    },
    {
      title: 'Build navigation sidebar',
      description: 'Responsive sidebar with collapsible sections',
      priority: 'high',
      statusIndex: 2,
    },
    {
      title: 'Implement routing',
      description: 'React Router v7 with lazy loading',
      priority: 'high',
      statusIndex: 3,
    },
    {
      title: 'Create form components',
      description: 'Input, Select, Checkbox, Radio with validation',
      priority: 'medium',
      statusIndex: 1,
    },
    {
      title: 'Add toast notification system',
      description: 'Success, error, warning, info toasts',
      priority: 'medium',
      statusIndex: 1,
    },
    {
      title: 'Build data table component',
      description: 'Sortable, filterable, paginated table',
      priority: 'high',
      statusIndex: 0,
    },
    {
      title: 'Implement infinite scroll',
      description: 'Virtual scrolling for large lists',
      priority: 'medium',
      statusIndex: 0,
    },
    {
      title: 'Add drag and drop',
      description: 'DnD Kit integration for kanban board',
      priority: 'high',
      statusIndex: 1,
    },
    {
      title: 'Create modal/dialog system',
      description: 'Accessible modal with focus trap',
      priority: 'medium',
      statusIndex: 2,
    },
    {
      title: 'Optimize bundle size',
      description: 'Code splitting and tree shaking',
      priority: 'low',
      statusIndex: 0,
    },
    {
      title: 'Add keyboard shortcuts',
      description: 'Global hotkeys for common actions',
      priority: 'low',
      statusIndex: 0,
    },
    {
      title: 'Implement command palette',
      description: 'Cmd+K search across all features',
      priority: 'medium',
      statusIndex: 0,
    },
    {
      title: 'Build settings page',
      description: 'User preferences and app configuration',
      priority: 'low',
      statusIndex: 0,
    },
    {
      title: 'Add responsive breakpoints',
      description: 'Mobile, tablet, desktop layouts',
      priority: 'medium',
      statusIndex: 1,
    },
  ],
  backend: [
    {
      title: 'Setup Hono framework',
      description: 'Initialize Bun + Hono with middleware',
      priority: 'high',
      statusIndex: 3,
    },
    {
      title: 'Configure SQLite + Drizzle',
      description: 'Database connection and ORM setup',
      priority: 'high',
      statusIndex: 3,
    },
    {
      title: 'Implement JWT auth middleware',
      description: 'Token generation, validation, refresh',
      priority: 'urgent',
      statusIndex: 1,
    },
    {
      title: 'Create projects CRUD',
      description: 'Full REST API for project management',
      priority: 'high',
      statusIndex: 3,
    },
    {
      title: 'Create issues CRUD',
      description: 'REST API with filtering and pagination',
      priority: 'high',
      statusIndex: 2,
    },
    {
      title: 'Add bulk update endpoint',
      description: 'Batch update issues for drag-and-drop',
      priority: 'high',
      statusIndex: 2,
    },
    {
      title: 'Implement rate limiting',
      description: 'Per-IP and per-user rate limits',
      priority: 'medium',
      statusIndex: 0,
    },
    {
      title: 'Add request validation',
      description: 'Zod schemas for all endpoints',
      priority: 'medium',
      statusIndex: 1,
    },
    {
      title: 'Setup error handling',
      description: 'Global error handler with proper HTTP codes',
      priority: 'high',
      statusIndex: 3,
    },
    {
      title: 'Add logging with Winston',
      description: 'Structured logging with log levels',
      priority: 'medium',
      statusIndex: 3,
    },
    {
      title: 'Implement WebSocket support',
      description: 'Real-time updates for board changes',
      priority: 'medium',
      statusIndex: 0,
    },
    {
      title: 'Create health check endpoint',
      description: 'Database and service health monitoring',
      priority: 'low',
      statusIndex: 3,
    },
    {
      title: 'Add CORS configuration',
      description: 'Cross-origin settings for frontend',
      priority: 'high',
      statusIndex: 3,
    },
    {
      title: 'Implement file uploads',
      description: 'Issue attachments with size limits',
      priority: 'low',
      statusIndex: 0,
    },
    {
      title: 'Database migration system',
      description: 'Drizzle Kit migrations with rollback',
      priority: 'high',
      statusIndex: 2,
    },
    {
      title: 'Add search API',
      description: 'Full-text search with SQLite FTS5',
      priority: 'medium',
      statusIndex: 0,
    },
    {
      title: 'Implement webhooks',
      description: 'Event notifications to external services',
      priority: 'low',
      statusIndex: 0,
    },
  ],
  mobile: [
    {
      title: 'Setup React Native project',
      description: 'Expo managed workflow with TypeScript',
      priority: 'high',
      statusIndex: 3,
    },
    {
      title: 'Configure navigation',
      description: 'React Navigation with tab and stack navigators',
      priority: 'high',
      statusIndex: 2,
    },
    {
      title: 'Build login screen',
      description: 'Email/password with biometric support',
      priority: 'urgent',
      statusIndex: 1,
    },
    {
      title: 'Create board view',
      description: 'Horizontal scrolling kanban columns',
      priority: 'high',
      statusIndex: 1,
    },
    {
      title: 'Implement offline support',
      description: 'SQLite local cache with sync',
      priority: 'medium',
      statusIndex: 0,
    },
    {
      title: 'Add push notifications',
      description: 'FCM/APNs integration for issue updates',
      priority: 'medium',
      statusIndex: 0,
    },
    {
      title: 'Build issue detail screen',
      description: 'Full issue view with comments',
      priority: 'high',
      statusIndex: 1,
    },
    {
      title: 'Add gesture controls',
      description: 'Swipe to change status, long press to drag',
      priority: 'medium',
      statusIndex: 0,
    },
    {
      title: 'Implement deep linking',
      description: 'URL scheme for issue links',
      priority: 'low',
      statusIndex: 0,
    },
    {
      title: 'Add haptic feedback',
      description: 'Tactile responses for drag and actions',
      priority: 'low',
      statusIndex: 0,
    },
    {
      title: 'Optimize list performance',
      description: 'FlashList for large issue lists',
      priority: 'medium',
      statusIndex: 0,
    },
    {
      title: 'Dark mode support',
      description: 'System theme detection and manual toggle',
      priority: 'low',
      statusIndex: 0,
    },
  ],
}

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

  // Auto-create default statuses
  const defaultStatuses = [
    { name: 'To Do', color: '#6b7280', sortOrder: 0 },
    { name: 'In Progress', color: '#3b82f6', sortOrder: 1 },
    { name: 'In Review', color: '#f59e0b', sortOrder: 2 },
    { name: 'Done', color: '#22c55e', sortOrder: 3 },
  ]
  for (const s of defaultStatuses) {
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
  },
): Issue {
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
    parentIssueId: null,
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
  updates: Array<{ id: string, changes: Partial<Pick<Issue, 'statusId' | 'sortOrder'>> }>,
): Issue[] {
  const result: Issue[] = []
  for (const { id, changes } of updates) {
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
