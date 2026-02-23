import type { Issue } from './memory-store'

export const DEFAULT_STATUSES = [
  { name: 'To Do', color: '#6b7280', sortOrder: 0 },
  { name: 'In Progress', color: '#3b82f6', sortOrder: 1 },
  { name: 'In Review', color: '#f59e0b', sortOrder: 2 },
  { name: 'Done', color: '#22c55e', sortOrder: 3 },
]

export const SEED_PROJECTS: Array<{ id: string, name: string }> = [
  { id: 'default', name: 'My Project' },
  { id: 'frontend', name: 'Frontend App' },
  { id: 'backend', name: 'Backend API' },
  { id: 'mobile', name: 'Mobile App' },
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
