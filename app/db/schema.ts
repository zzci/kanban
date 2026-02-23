import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { ulid } from 'ulid'

export const commonFields = {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => ulid()),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
  isDeleted: integer('is_deleted').notNull().default(0),
}

export const projects = sqliteTable('projects', {
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  directory: text('directory'),
  repositoryUrl: text('repository_url'),
  ...commonFields,
})

export const runtimeEvents = sqliteTable('runtime_events', {
  event: text('event').notNull(),
  ...commonFields,
})

export const agentProfiles = sqliteTable('agent_profiles', {
  agentType: text('agent_type').notNull(),
  name: text('name').notNull(),
  binaryPath: text('binary_path'),
  baseCommand: text('base_command').notNull(),
  protocol: text('protocol').notNull(),
  capabilities: text('capabilities').notNull().default('[]'),
  defaultModel: text('default_model'),
  permissionPolicy: text('permission_policy').notNull().default('auto'),
  config: text('config'),
  ...commonFields,
})

export const agentSessions = sqliteTable('agent_sessions', {
  projectId: text('project_id').notNull(),
  issueId: text('issue_id'),
  agentProfileId: text('agent_profile_id').notNull(),
  status: text('status').notNull().default('pending'),
  prompt: text('prompt').notNull(),
  externalSessionId: text('external_session_id'),
  workingDir: text('working_dir'),
  model: text('model'),
  ...commonFields,
})

export const executionProcesses = sqliteTable('execution_processes', {
  sessionId: text('session_id').notNull(),
  pid: integer('pid'),
  status: text('status').notNull().default('spawning'),
  exitCode: integer('exit_code'),
  startedAt: integer('started_at', { mode: 'timestamp' }),
  finishedAt: integer('finished_at', { mode: 'timestamp' }),
  actionType: text('action_type').notNull().default('initial'),
  ...commonFields,
})

export const executionLogs = sqliteTable('execution_logs', {
  processId: text('process_id').notNull(),
  entryIndex: integer('entry_index').notNull(),
  entryType: text('entry_type').notNull(),
  content: text('content').notNull(),
  metadata: text('metadata'),
  timestamp: text('timestamp'),
  ...commonFields,
})
