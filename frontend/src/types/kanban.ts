export type Priority = 'urgent' | 'high' | 'medium' | 'low'

export type Project = {
  id: string
  slug: string
  name: string
  description?: string
  directory?: string
  repositoryUrl?: string
  createdAt: string
  updatedAt: string
}

export type Status = {
  id: string
  projectId: string
  name: string
  color: string
  sortOrder: number
}

export type Issue = {
  id: string
  projectId: string
  statusId: string
  issueNumber: number
  displayId: string
  title: string
  description: string | null
  priority: Priority
  sortOrder: number
  parentIssueId: string | null
  useWorktree: boolean
  createdAt: string
  updatedAt: string
}

export type Tag = {
  id: string
  projectId: string
  name: string
  color: string
}

export type IssueWithTags = Issue & { tags: Tag[] }

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string }

// --- Session / Agent types ---

export type AgentType = 'claude-code' | 'codex' | 'gemini'
export type SessionStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled'
export type LogEntryType =
  | 'user-message'
  | 'assistant-message'
  | 'tool-use'
  | 'system-message'
  | 'error-message'
  | 'thinking'
  | 'loading'
  | 'token-usage'
export type CommandCategory = 'read' | 'search' | 'edit' | 'fetch' | 'other'

export interface FileChange {
  oldText: string
  newText: string
}

export type ToolAction =
  | { kind: 'file-read'; path: string }
  | { kind: 'file-edit'; path: string; changes?: FileChange[] }
  | {
      kind: 'command-run'
      command: string
      result?: string
      category?: CommandCategory
    }
  | { kind: 'search'; query: string }
  | { kind: 'web-fetch'; url: string }
  | { kind: 'tool'; toolName: string; arguments?: unknown; result?: unknown }
  | { kind: 'other'; description: string }

export interface NormalizedLogEntry {
  timestamp?: string
  entryType: LogEntryType
  content: string
  metadata?: Record<string, unknown>
  toolAction?: ToolAction
}

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

export interface CreateSessionRequest {
  agentType: AgentType
  prompt: string
  issueId?: string
  name?: string
  workingDir?: string
  model?: string
}

export interface ExecuteSessionResponse {
  executionId: string
  sessionId: string
}

export interface SessionLogsResponse {
  session: AgentSession
  logs: NormalizedLogEntry[]
}
