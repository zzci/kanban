// ---------- Enums / Literal Unions ----------

// Supported AI agent types
export type AgentType = 'claude-code' | 'codex' | 'gemini'

// Communication protocols
export type AgentProtocol = 'stream-json' | 'json-rpc' | 'acp'

// Agent capabilities
export type AgentCapability
  = | 'session-fork'
    | 'setup-helper'
    | 'context-usage'
    | 'plan-mode'
    | 'sandbox'
    | 'reasoning'

// Permission policies
export type PermissionPolicy = 'auto' | 'supervised' | 'bypass' | 'plan'

// Session lifecycle status
export type SessionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'

// Process lifecycle status
export type ProcessStatus = 'spawning' | 'running' | 'completed' | 'failed' | 'cancelled'

// Execution action types
export type ActionType = 'initial' | 'follow-up' | 'review' | 'script'

// Normalized log entry types
export type LogEntryType
  = | 'user-message'
    | 'assistant-message'
    | 'tool-use'
    | 'system-message'
    | 'error-message'
    | 'thinking'
    | 'loading'
    | 'token-usage'

// Shell command categories
export type CommandCategory = 'read' | 'search' | 'edit' | 'fetch' | 'other'

// ---------- Interfaces ----------

export interface FileChange {
  oldText: string
  newText: string
}

// Tool action discriminated union
export type ToolAction
  = | { kind: 'file-read', path: string }
    | { kind: 'file-edit', path: string, changes?: FileChange[] }
    | { kind: 'command-run', command: string, result?: string, category?: CommandCategory }
    | { kind: 'search', query: string }
    | { kind: 'web-fetch', url: string }
    | { kind: 'tool', toolName: string, arguments?: unknown, result?: unknown }
    | { kind: 'other', description: string }

// Agent availability (discovery result)
export interface AgentAvailability {
  agentType: AgentType
  installed: boolean
  version?: string
  binaryPath?: string
  authStatus: 'authenticated' | 'unauthenticated' | 'unknown'
  error?: string
}

// Model definition for an agent
export interface AgentModel {
  id: string
  name: string
  description?: string
}

// Agent profile configuration
export interface AgentProfile {
  id?: string
  agentType: AgentType
  name: string
  baseCommand: string
  protocol: AgentProtocol
  capabilities: AgentCapability[]
  defaultModel?: string
  permissionPolicy: PermissionPolicy
  config?: Record<string, unknown>
}

// Spawn options for initial execution
export interface SpawnOptions {
  workingDir: string
  prompt: string
  model?: string
  permissionMode?: PermissionPolicy
  env?: Record<string, string>
  agent?: string
  dangerouslySkipPermissions?: boolean
}

// Follow-up options (extends spawn)
export interface FollowUpOptions extends SpawnOptions {
  sessionId: string
  resetToMessageId?: string
}

// Command builder output
export interface CommandParts {
  program: string
  args: string[]
  env: Record<string, string>
  cwd?: string
}

// Resolved command (with full binary path)
export interface ResolvedCommand extends CommandParts {
  resolvedPath: string
}

// We use the Bun Subprocess type
type Subprocess = ReturnType<typeof Bun.spawn>

// Spawned process wrapper
export interface SpawnedProcess {
  subprocess: Subprocess
  sessionId?: string
  stdout: ReadableStream<Uint8Array>
  stderr: ReadableStream<Uint8Array>
  cancel: () => void
}

// Normalized log entry (unified format for all agents)
export interface NormalizedLogEntry {
  timestamp?: string
  entryType: LogEntryType
  content: string
  metadata?: Record<string, unknown>
  toolAction?: ToolAction
}

// Executor config (for profile-based resolution)
export interface ExecutorConfig {
  agentType: AgentType
  variant?: string
  modelId?: string
  agentId?: string
  permissionPolicy?: PermissionPolicy
}

// Execution environment
export interface ExecutionEnv {
  vars: Record<string, string>
  workingDir: string
  projectId?: string
  sessionId?: string
  issueId?: string
}

// Agent session (runtime state)
export interface AgentSession {
  id: string
  name: string
  projectId: string
  issueId?: string
  agentType: AgentType
  status: SessionStatus
  prompt: string
  externalSessionId?: string
  workingDir?: string
  model?: string
  createdAt: string
  updatedAt: string
}

// Execution process (runtime state)
export interface ExecutionProcess {
  id: string
  sessionId: string
  pid?: number
  status: ProcessStatus
  exitCode?: number
  startedAt?: string
  finishedAt?: string
  actionType: ActionType
  createdAt: string
  updatedAt: string
}

// ---------- Interfaces (Behavioral) ----------

// Agent executor interface (one per agent type)
export interface AgentExecutor {
  readonly agentType: AgentType
  readonly protocol: AgentProtocol
  readonly capabilities: AgentCapability[]

  spawn: (options: SpawnOptions, env: ExecutionEnv) => Promise<SpawnedProcess>
  spawnFollowUp: (options: FollowUpOptions, env: ExecutionEnv) => Promise<SpawnedProcess>
  cancel: (process: SpawnedProcess) => Promise<void>
  getAvailability: () => Promise<AgentAvailability>
  getModels: () => Promise<AgentModel[]>
  normalizeLog: (rawLine: string) => NormalizedLogEntry | null
}

// Agent registry (manages all executors)
export interface AgentRegistry {
  register: (executor: AgentExecutor) => void
  get: (agentType: AgentType) => AgentExecutor | undefined
  getAll: () => AgentExecutor[]
  getAvailable: () => Promise<AgentAvailability[]>
  getModels: (agentType: AgentType) => Promise<AgentModel[]>
}

// ---------- Constants ----------

// Default built-in agent profiles
export const BUILT_IN_PROFILES: Record<AgentType, AgentProfile> = {
  'claude-code': {
    agentType: 'claude-code',
    name: 'Claude Code',
    baseCommand: 'npx -y @anthropic-ai/claude-code@latest',
    protocol: 'stream-json',
    capabilities: ['session-fork', 'context-usage', 'plan-mode'],
    defaultModel: 'claude-sonnet-4-6',
    permissionPolicy: 'bypass',
  },
  'codex': {
    agentType: 'codex',
    name: 'Codex',
    baseCommand: 'npx -y @openai/codex@latest app-server',
    protocol: 'json-rpc',
    capabilities: ['session-fork', 'setup-helper', 'context-usage', 'sandbox', 'reasoning'],
    defaultModel: 'o4-mini',
    permissionPolicy: 'auto',
  },
  'gemini': {
    agentType: 'gemini',
    name: 'Gemini CLI',
    baseCommand: 'npx -y @google/gemini-cli@latest',
    protocol: 'acp',
    capabilities: ['session-fork'],
    defaultModel: 'gemini-2.5-pro',
    permissionPolicy: 'auto',
  },
}
