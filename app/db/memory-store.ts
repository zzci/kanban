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
  { id: 'infra', name: 'Infrastructure' },
  { id: 'design', name: 'Design System' },
  { id: 'docs', name: 'Documentation' },
  { id: 'analytics', name: 'Analytics Platform' },
  { id: 'auth', name: 'Auth Service' },
  { id: 'payments', name: 'Payments' },
  { id: 'search', name: 'Search Engine' },
  { id: 'notifications', name: 'Notifications' },
  { id: 'ai', name: 'AI Agent' },
  { id: 'devtools', name: 'DevTools' },
  { id: 'testing', name: 'QA & Testing' },
  { id: 'i18n', name: 'Internationalization' },
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
  infra: [
    {
      title: 'Setup Docker containers',
      description: 'Dockerfile for API and frontend',
      priority: 'high',
      statusIndex: 3,
    },
    {
      title: 'Configure GitHub Actions',
      description: 'CI pipeline for lint, test, build',
      priority: 'high',
      statusIndex: 2,
    },
    {
      title: 'Setup staging environment',
      description: 'Deploy preview for pull requests',
      priority: 'medium',
      statusIndex: 1,
    },
    {
      title: 'Configure monitoring',
      description: 'Uptime checks and alerting',
      priority: 'medium',
      statusIndex: 0,
    },
    {
      title: 'Setup log aggregation',
      description: 'Centralized logging with search',
      priority: 'medium',
      statusIndex: 0,
    },
    {
      title: 'Implement auto-scaling',
      description: 'Scale based on CPU and memory metrics',
      priority: 'low',
      statusIndex: 0,
    },
    {
      title: 'Configure CDN',
      description: 'Static asset caching and distribution',
      priority: 'medium',
      statusIndex: 1,
    },
    {
      title: 'Setup database backups',
      description: 'Automated daily backups with retention',
      priority: 'urgent',
      statusIndex: 1,
    },
    {
      title: 'SSL certificate automation',
      description: 'Let\'s Encrypt auto-renewal',
      priority: 'high',
      statusIndex: 3,
    },
    {
      title: 'Infrastructure as code',
      description: 'Terraform for cloud resources',
      priority: 'medium',
      statusIndex: 0,
    },
  ],
  design: [
    {
      title: 'Define color tokens',
      description: 'Primary, secondary, semantic colors in oklch',
      priority: 'high',
      statusIndex: 3,
    },
    {
      title: 'Create typography scale',
      description: 'Font sizes, weights, line heights',
      priority: 'high',
      statusIndex: 3,
    },
    {
      title: 'Build Button component',
      description: 'Variants: primary, secondary, ghost, destructive',
      priority: 'high',
      statusIndex: 3,
    },
    {
      title: 'Build Input component',
      description: 'Text, password, search with states',
      priority: 'high',
      statusIndex: 2,
    },
    {
      title: 'Build Card component',
      description: 'Header, content, footer slots',
      priority: 'medium',
      statusIndex: 3,
    },
    {
      title: 'Build Badge component',
      description: 'Status indicators with colors',
      priority: 'medium',
      statusIndex: 3,
    },
    {
      title: 'Create icon library',
      description: 'Lucide icons with consistent sizing',
      priority: 'medium',
      statusIndex: 2,
    },
    {
      title: 'Build Dropdown component',
      description: 'Accessible dropdown with keyboard nav',
      priority: 'high',
      statusIndex: 1,
    },
    {
      title: 'Build Tooltip component',
      description: 'Hover and focus tooltips with positioning',
      priority: 'medium',
      statusIndex: 1,
    },
    {
      title: 'Create spacing system',
      description: '4px grid with named tokens',
      priority: 'high',
      statusIndex: 3,
    },
    {
      title: 'Build Avatar component',
      description: 'Image with fallback initials',
      priority: 'low',
      statusIndex: 0,
    },
    {
      title: 'Build Skeleton loader',
      description: 'Loading placeholder animations',
      priority: 'low',
      statusIndex: 0,
    },
    {
      title: 'Create animation tokens',
      description: 'Duration, easing, transition presets',
      priority: 'low',
      statusIndex: 0,
    },
    {
      title: 'Design empty states',
      description: 'Illustrations for no-data scenarios',
      priority: 'medium',
      statusIndex: 0,
    },
  ],
  docs: [
    {
      title: 'Write getting started guide',
      description: 'Installation and first project setup',
      priority: 'high',
      statusIndex: 2,
    },
    {
      title: 'Document API endpoints',
      description: 'OpenAPI spec with examples',
      priority: 'high',
      statusIndex: 1,
    },
    {
      title: 'Create component storybook',
      description: 'Interactive component documentation',
      priority: 'medium',
      statusIndex: 0,
    },
    {
      title: 'Write deployment guide',
      description: 'Step-by-step production deployment',
      priority: 'medium',
      statusIndex: 0,
    },
    {
      title: 'Add changelog',
      description: 'Version history with breaking changes',
      priority: 'low',
      statusIndex: 0,
    },
    {
      title: 'Create architecture diagrams',
      description: 'System overview and data flow',
      priority: 'medium',
      statusIndex: 1,
    },
    {
      title: 'Write contributing guide',
      description: 'Code style, PR process, issue templates',
      priority: 'low',
      statusIndex: 0,
    },
    {
      title: 'Document environment variables',
      description: 'All config options with defaults',
      priority: 'medium',
      statusIndex: 0,
    },
  ],
  analytics: [
    {
      title: 'Setup event tracking',
      description: 'Client-side event collection',
      priority: 'high',
      statusIndex: 1,
    },
    {
      title: 'Build dashboard layout',
      description: 'Grid-based widget dashboard',
      priority: 'high',
      statusIndex: 1,
    },
    {
      title: 'Create chart components',
      description: 'Line, bar, pie charts with D3',
      priority: 'high',
      statusIndex: 0,
    },
    {
      title: 'Implement data pipeline',
      description: 'Event ingestion and aggregation',
      priority: 'urgent',
      statusIndex: 0,
    },
    {
      title: 'Add funnel analysis',
      description: 'User flow conversion tracking',
      priority: 'medium',
      statusIndex: 0,
    },
    {
      title: 'Build retention charts',
      description: 'Cohort analysis visualization',
      priority: 'medium',
      statusIndex: 0,
    },
    {
      title: 'Create export system',
      description: 'CSV and PDF report generation',
      priority: 'low',
      statusIndex: 0,
    },
    {
      title: 'Real-time metrics',
      description: 'WebSocket-powered live counters',
      priority: 'medium',
      statusIndex: 0,
    },
    {
      title: 'Add date range picker',
      description: 'Custom period selection for reports',
      priority: 'medium',
      statusIndex: 0,
    },
    {
      title: 'Implement A/B testing',
      description: 'Feature flag based experiments',
      priority: 'low',
      statusIndex: 0,
    },
  ],
  auth: [
    {
      title: 'Implement OAuth2 provider',
      description: 'Google, GitHub, GitLab SSO',
      priority: 'urgent',
      statusIndex: 1,
    },
    {
      title: 'Add SAML support',
      description: 'Enterprise SSO with SAML 2.0',
      priority: 'high',
      statusIndex: 0,
    },
    {
      title: 'Build user management UI',
      description: 'Admin panel for user CRUD',
      priority: 'high',
      statusIndex: 2,
    },
    {
      title: 'Implement MFA/TOTP',
      description: 'Two-factor authentication with QR codes',
      priority: 'urgent',
      statusIndex: 1,
    },
    {
      title: 'Add password policy',
      description: 'Strength requirements, expiry, history',
      priority: 'medium',
      statusIndex: 3,
    },
    {
      title: 'Session management',
      description: 'Token refresh, revocation, device tracking',
      priority: 'high',
      statusIndex: 2,
    },
    {
      title: 'Role-based access control',
      description: 'Fine-grained permissions system',
      priority: 'high',
      statusIndex: 1,
    },
    {
      title: 'Audit logging',
      description: 'Track all auth events for compliance',
      priority: 'medium',
      statusIndex: 0,
    },
    {
      title: 'Rate limit login attempts',
      description: 'Brute force protection with lockout',
      priority: 'high',
      statusIndex: 3,
    },
    {
      title: 'Password reset flow',
      description: 'Email-based password recovery',
      priority: 'high',
      statusIndex: 3,
    },
    {
      title: 'API key management',
      description: 'Create, rotate, revoke API keys',
      priority: 'medium',
      statusIndex: 0,
    },
    {
      title: 'JWT token rotation',
      description: 'Automatic refresh token rotation',
      priority: 'medium',
      statusIndex: 1,
    },
  ],
  payments: [
    {
      title: 'Integrate Stripe',
      description: 'Payment intent API for subscriptions',
      priority: 'urgent',
      statusIndex: 1,
    },
    {
      title: 'Build pricing page',
      description: 'Tiered pricing with feature comparison',
      priority: 'high',
      statusIndex: 2,
    },
    {
      title: 'Implement webhooks handler',
      description: 'Process Stripe events reliably',
      priority: 'urgent',
      statusIndex: 1,
    },
    {
      title: 'Add invoice generation',
      description: 'PDF invoices with tax calculation',
      priority: 'high',
      statusIndex: 0,
    },
    {
      title: 'Subscription lifecycle',
      description: 'Create, upgrade, downgrade, cancel flows',
      priority: 'high',
      statusIndex: 1,
    },
    {
      title: 'Usage-based billing',
      description: 'Metered billing for API calls',
      priority: 'medium',
      statusIndex: 0,
    },
    {
      title: 'Add coupon system',
      description: 'Promo codes and discounts',
      priority: 'low',
      statusIndex: 0,
    },
    {
      title: 'Payment method management',
      description: 'Add/remove cards, set default',
      priority: 'high',
      statusIndex: 2,
    },
    {
      title: 'Refund processing',
      description: 'Full and partial refunds',
      priority: 'medium',
      statusIndex: 0,
    },
    {
      title: 'Revenue dashboard',
      description: 'MRR, churn, LTV metrics',
      priority: 'medium',
      statusIndex: 0,
    },
    {
      title: 'Tax compliance',
      description: 'VAT/GST calculation by region',
      priority: 'high',
      statusIndex: 0,
    },
    {
      title: 'Dunning management',
      description: 'Failed payment retry and notifications',
      priority: 'medium',
      statusIndex: 0,
    },
    {
      title: 'Free trial logic',
      description: '14-day trial with conversion tracking',
      priority: 'high',
      statusIndex: 3,
    },
  ],
  search: [
    {
      title: 'Setup Meilisearch',
      description: 'Deploy and configure search engine',
      priority: 'high',
      statusIndex: 3,
    },
    {
      title: 'Build search index pipeline',
      description: 'Real-time indexing from database changes',
      priority: 'high',
      statusIndex: 2,
    },
    {
      title: 'Implement fuzzy matching',
      description: 'Typo-tolerant search with ranking',
      priority: 'high',
      statusIndex: 1,
    },
    {
      title: 'Add faceted search',
      description: 'Filter by status, priority, assignee',
      priority: 'medium',
      statusIndex: 1,
    },
    {
      title: 'Search analytics',
      description: 'Track queries, clicks, no-results',
      priority: 'low',
      statusIndex: 0,
    },
    {
      title: 'Auto-suggest/typeahead',
      description: 'Real-time suggestions as user types',
      priority: 'high',
      statusIndex: 1,
    },
    {
      title: 'Multi-language support',
      description: 'CJK tokenizer and language detection',
      priority: 'medium',
      statusIndex: 0,
    },
    {
      title: 'Search result highlighting',
      description: 'Bold matched terms in results',
      priority: 'medium',
      statusIndex: 3,
    },
    {
      title: 'Synonym configuration',
      description: 'Custom synonym mappings per project',
      priority: 'low',
      statusIndex: 0,
    },
    {
      title: 'Build search UI component',
      description: 'Cmd+K dialog with filters',
      priority: 'high',
      statusIndex: 2,
    },
  ],
  notifications: [
    {
      title: 'Design notification schema',
      description: 'Types, priorities, delivery channels',
      priority: 'high',
      statusIndex: 3,
    },
    {
      title: 'Build notification center UI',
      description: 'Bell icon with dropdown list',
      priority: 'high',
      statusIndex: 2,
    },
    {
      title: 'Email notification service',
      description: 'Transactional emails with templates',
      priority: 'high',
      statusIndex: 1,
    },
    {
      title: 'In-app real-time notifications',
      description: 'WebSocket push for live updates',
      priority: 'high',
      statusIndex: 1,
    },
    {
      title: 'Notification preferences',
      description: 'Per-channel opt-in/opt-out settings',
      priority: 'medium',
      statusIndex: 0,
    },
    {
      title: 'Digest/batch notifications',
      description: 'Hourly/daily summary emails',
      priority: 'medium',
      statusIndex: 0,
    },
    {
      title: 'Push notifications (mobile)',
      description: 'FCM/APNs integration',
      priority: 'medium',
      statusIndex: 0,
    },
    {
      title: 'Slack integration',
      description: 'Post notifications to Slack channels',
      priority: 'medium',
      statusIndex: 1,
    },
    {
      title: 'Mark all as read',
      description: 'Bulk action for notification management',
      priority: 'low',
      statusIndex: 0,
    },
    {
      title: 'Notification templates',
      description: 'Handlebars templates for each event type',
      priority: 'high',
      statusIndex: 2,
    },
    {
      title: 'Rate limiting notifications',
      description: 'Prevent notification storms',
      priority: 'medium',
      statusIndex: 0,
    },
  ],
  ai: [
    {
      title: 'Setup Claude API integration',
      description: 'Anthropic SDK with streaming responses',
      priority: 'urgent',
      statusIndex: 1,
    },
    {
      title: 'Build chat interface',
      description: 'Message list with streaming assistant response',
      priority: 'high',
      statusIndex: 2,
    },
    {
      title: 'Implement tool use',
      description: 'Function calling for issue operations',
      priority: 'high',
      statusIndex: 1,
    },
    {
      title: 'Add context window management',
      description: 'Token counting and conversation pruning',
      priority: 'high',
      statusIndex: 1,
    },
    {
      title: 'Create system prompts',
      description: 'Role-specific prompts for each agent type',
      priority: 'medium',
      statusIndex: 2,
    },
    {
      title: 'Implement RAG pipeline',
      description: 'Vector search over project documents',
      priority: 'high',
      statusIndex: 0,
    },
    {
      title: 'Add conversation history',
      description: 'Persist and resume chat sessions',
      priority: 'medium',
      statusIndex: 0,
    },
    {
      title: 'Build agent orchestration',
      description: 'Multi-agent workflow with handoffs',
      priority: 'high',
      statusIndex: 0,
    },
    {
      title: 'Cost tracking and budgets',
      description: 'Per-user and per-project token budgets',
      priority: 'medium',
      statusIndex: 0,
    },
    {
      title: 'Model fallback chain',
      description: 'Opus → Sonnet → Haiku based on task',
      priority: 'medium',
      statusIndex: 0,
    },
    {
      title: 'Streaming response UI',
      description: 'Typewriter effect with thinking indicator',
      priority: 'high',
      statusIndex: 3,
    },
    {
      title: 'Prompt caching',
      description: 'Cache common prefix prompts for cost savings',
      priority: 'low',
      statusIndex: 0,
    },
    {
      title: 'Add code execution sandbox',
      description: 'Run generated code safely',
      priority: 'medium',
      statusIndex: 0,
    },
    {
      title: 'Implement memory system',
      description: 'Long-term memory across conversations',
      priority: 'high',
      statusIndex: 0,
    },
  ],
  devtools: [
    {
      title: 'Build CLI tool',
      description: 'Command-line interface for project management',
      priority: 'high',
      statusIndex: 2,
    },
    {
      title: 'Create VS Code extension',
      description: 'Issue browser and quick actions in editor',
      priority: 'high',
      statusIndex: 1,
    },
    {
      title: 'Setup development database seeder',
      description: 'Generate realistic test data',
      priority: 'medium',
      statusIndex: 3,
    },
    {
      title: 'Build API playground',
      description: 'Interactive API explorer with auth',
      priority: 'medium',
      statusIndex: 1,
    },
    {
      title: 'Create debug logging panel',
      description: 'Real-time log viewer in dev mode',
      priority: 'low',
      statusIndex: 0,
    },
    {
      title: 'Add performance profiler',
      description: 'Query timing and bottleneck detection',
      priority: 'medium',
      statusIndex: 0,
    },
    {
      title: 'Build migration tool',
      description: 'Import from Jira, Trello, Linear',
      priority: 'high',
      statusIndex: 0,
    },
    {
      title: 'Create SDK generator',
      description: 'Auto-generate client SDKs from OpenAPI',
      priority: 'medium',
      statusIndex: 0,
    },
    {
      title: 'Git hooks integration',
      description: 'Pre-commit checks and issue linking',
      priority: 'low',
      statusIndex: 3,
    },
    {
      title: 'Local dev environment setup',
      description: 'Docker Compose with hot reload',
      priority: 'high',
      statusIndex: 3,
    },
  ],
  testing: [
    {
      title: 'Setup Playwright e2e',
      description: 'Browser automation for critical flows',
      priority: 'high',
      statusIndex: 2,
    },
    {
      title: 'Write API integration tests',
      description: 'Test all endpoints with fixtures',
      priority: 'high',
      statusIndex: 1,
    },
    {
      title: 'Add visual regression testing',
      description: 'Screenshot comparison for UI changes',
      priority: 'medium',
      statusIndex: 0,
    },
    {
      title: 'Build test data factory',
      description: 'Faker-based factories for all entities',
      priority: 'high',
      statusIndex: 3,
    },
    {
      title: 'Setup code coverage reporting',
      description: 'Istanbul/c8 with CI integration',
      priority: 'medium',
      statusIndex: 3,
    },
    {
      title: 'Load testing with k6',
      description: 'Performance benchmarks for API',
      priority: 'medium',
      statusIndex: 0,
    },
    {
      title: 'Add accessibility testing',
      description: 'axe-core automated a11y checks',
      priority: 'medium',
      statusIndex: 0,
    },
    {
      title: 'Create test environment',
      description: 'Isolated database for test runs',
      priority: 'high',
      statusIndex: 3,
    },
    {
      title: 'Implement contract testing',
      description: 'API contract validation between services',
      priority: 'low',
      statusIndex: 0,
    },
    {
      title: 'Flaky test detection',
      description: 'Auto-quarantine unreliable tests',
      priority: 'medium',
      statusIndex: 0,
    },
    {
      title: 'Test reporting dashboard',
      description: 'Historical pass/fail trends and metrics',
      priority: 'low',
      statusIndex: 0,
    },
    {
      title: 'Security penetration tests',
      description: 'OWASP ZAP automated scanning',
      priority: 'high',
      statusIndex: 1,
    },
  ],
  i18n: [
    {
      title: 'Setup i18next framework',
      description: 'React-i18next with namespace support',
      priority: 'high',
      statusIndex: 3,
    },
    {
      title: 'Extract all strings',
      description: 'Replace hardcoded text with translation keys',
      priority: 'urgent',
      statusIndex: 1,
    },
    {
      title: 'Add Chinese (zh-CN) locale',
      description: 'Simplified Chinese translations',
      priority: 'high',
      statusIndex: 2,
    },
    {
      title: 'Add Japanese (ja) locale',
      description: 'Japanese translations',
      priority: 'high',
      statusIndex: 1,
    },
    {
      title: 'Build language switcher',
      description: 'Dropdown in header with flag icons',
      priority: 'medium',
      statusIndex: 2,
    },
    {
      title: 'RTL support',
      description: 'Right-to-left layout for Arabic/Hebrew',
      priority: 'medium',
      statusIndex: 0,
    },
    {
      title: 'Date/number formatting',
      description: 'Locale-aware Intl formatters',
      priority: 'high',
      statusIndex: 3,
    },
    {
      title: 'Pluralization rules',
      description: 'Handle plural forms per language',
      priority: 'medium',
      statusIndex: 0,
    },
    {
      title: 'Translation management',
      description: 'Crowdin/Lokalise integration',
      priority: 'low',
      statusIndex: 0,
    },
    {
      title: 'Add Korean (ko) locale',
      description: 'Korean translations',
      priority: 'medium',
      statusIndex: 0,
    },
    {
      title: 'Missing translation fallback',
      description: 'Graceful fallback to English',
      priority: 'high',
      statusIndex: 3,
    },
    {
      title: 'Context-based translations',
      description: 'Different translations per page context',
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
