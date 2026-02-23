import type { ActionType, AgentSession, AgentType, ExecutionProcess } from './types'
import { ulid } from 'ulid'

const now = () => new Date().toISOString()

// ---------- Storage ----------
let agentSessions: AgentSession[] = []
let executionProcesses: ExecutionProcess[] = []

// ---------- Agent Sessions ----------

export function getAgentSessionsByProject(projectId: string): AgentSession[] {
  return agentSessions.filter(s => s.projectId === projectId)
}

export function getAgentSession(id: string): AgentSession | undefined {
  return agentSessions.find(s => s.id === id)
}

export function createAgentSession(data: {
  projectId: string
  issueId?: string
  agentType: AgentType
  prompt: string
  workingDir?: string
  model?: string
}): AgentSession {
  const session: AgentSession = {
    id: ulid(),
    projectId: data.projectId,
    issueId: data.issueId,
    agentType: data.agentType,
    status: 'pending',
    prompt: data.prompt,
    workingDir: data.workingDir,
    model: data.model,
    createdAt: now(),
    updatedAt: now(),
  }
  agentSessions = [...agentSessions, session]
  return session
}

export function updateAgentSession(
  id: string,
  changes: Partial<Pick<AgentSession, 'status' | 'externalSessionId' | 'model'>>,
): AgentSession | undefined {
  const idx = agentSessions.findIndex(s => s.id === id)
  if (idx === -1)
    return undefined
  const updated = { ...agentSessions[idx]!, ...changes, updatedAt: now() }
  agentSessions = agentSessions.map((s, i) => (i === idx ? updated : s))
  return updated
}

// ---------- Execution Processes ----------

export function getExecutionProcessesBySession(sessionId: string): ExecutionProcess[] {
  return executionProcesses.filter(p => p.sessionId === sessionId)
}

export function getExecutionProcess(id: string): ExecutionProcess | undefined {
  return executionProcesses.find(p => p.id === id)
}

export function createExecutionProcess(data: {
  sessionId: string
  actionType: ActionType
  pid?: number
}): ExecutionProcess {
  const process: ExecutionProcess = {
    id: ulid(),
    sessionId: data.sessionId,
    pid: data.pid,
    status: 'spawning',
    actionType: data.actionType,
    startedAt: now(),
    createdAt: now(),
    updatedAt: now(),
  }
  executionProcesses = [...executionProcesses, process]
  return process
}

export function updateExecutionProcess(
  id: string,
  changes: Partial<Pick<ExecutionProcess, 'status' | 'exitCode' | 'pid' | 'finishedAt'>>,
): ExecutionProcess | undefined {
  const idx = executionProcesses.findIndex(p => p.id === id)
  if (idx === -1)
    return undefined
  const updated = { ...executionProcesses[idx]!, ...changes, updatedAt: now() }
  executionProcesses = executionProcesses.map((p, i) => (i === idx ? updated : p))
  return updated
}
