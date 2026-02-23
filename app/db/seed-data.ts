import type { Issue } from './memory-store'

export const DEFAULT_STATUSES = [
  { name: 'To Do', color: '#6b7280', sortOrder: 0 },
  { name: 'In Progress', color: '#3b82f6', sortOrder: 1 },
  { name: 'In Review', color: '#f59e0b', sortOrder: 2 },
  { name: 'Done', color: '#22c55e', sortOrder: 3 },
]

export const SEED_PROJECTS: Array<{ id: string, name: string }> = [
  { id: 'default', name: 'My Project' },
]

export const ISSUE_SEEDS: Record<
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
}
