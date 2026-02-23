import type { AgentSession, AgentType, NormalizedLogEntry, SpawnedProcess } from './types'
import {
  createAgentSession,
  createExecutionProcess,
  getAgentSession,
  getAgentSessionsByProject,
  updateAgentSession,
  updateExecutionProcess,
} from './agent-store'
import { agentRegistry } from './executors'
import { processManager } from './process-manager'

export class SessionManager {
  createSession(options: {
    projectId: string
    issueId?: string
    agentType: AgentType
    prompt: string
    workingDir?: string
    model?: string
  }): AgentSession {
    return createAgentSession(options)
  }

  async executeSession(
    sessionId: string,
  ): Promise<{ executionId: string, process: SpawnedProcess }> {
    const session = getAgentSession(sessionId)
    if (!session)
      throw new Error(`Session not found: ${sessionId}`)

    const executor = agentRegistry.get(session.agentType)
    if (!executor)
      throw new Error(`No executor for agent type: ${session.agentType}`)

    // Update session status
    updateAgentSession(sessionId, { status: 'running' })

    // Create execution process record
    const execRecord = createExecutionProcess({
      sessionId,
      actionType: session.externalSessionId ? 'follow-up' : 'initial',
    })

    // Determine working directory
    const workingDir = session.workingDir ?? process.cwd()

    // Spawn the agent
    const spawned = await executor.spawn(
      {
        workingDir,
        prompt: session.prompt,
        model: session.model,
        permissionMode: 'bypass',
        dangerouslySkipPermissions: true,
      },
      {
        vars: {},
        workingDir,
        projectId: session.projectId,
        sessionId,
        issueId: session.issueId,
      },
    )

    // Update with PID
    updateExecutionProcess(execRecord.id, {
      status: 'running',
      pid: spawned.subprocess.pid,
    })

    // Register with process manager
    processManager.register(execRecord.id, sessionId, spawned, line =>
      executor.normalizeLog(line))

    // Monitor completion
    processManager.onStateChange((execId, state) => {
      if (execId !== execRecord.id)
        return
      updateExecutionProcess(execId, {
        status: state,
        finishedAt:
          state === 'completed' || state === 'failed' || state === 'cancelled'
            ? new Date().toISOString()
            : undefined,
      })
      if (state === 'completed' || state === 'failed' || state === 'cancelled') {
        updateAgentSession(sessionId, { status: state })
      }
    })

    return { executionId: execRecord.id, process: spawned }
  }

  async followUpSession(
    sessionId: string,
    prompt: string,
  ): Promise<{ executionId: string, process: SpawnedProcess }> {
    const session = getAgentSession(sessionId)
    if (!session)
      throw new Error(`Session not found: ${sessionId}`)
    if (!session.externalSessionId)
      throw new Error('No external session ID for follow-up')

    const executor = agentRegistry.get(session.agentType)
    if (!executor)
      throw new Error(`No executor for agent type: ${session.agentType}`)

    updateAgentSession(sessionId, { status: 'running' })

    const execRecord = createExecutionProcess({
      sessionId,
      actionType: 'follow-up',
    })

    const workingDir = session.workingDir ?? process.cwd()

    const spawned = await executor.spawnFollowUp(
      {
        workingDir,
        prompt,
        sessionId: session.externalSessionId,
        model: session.model,
        permissionMode: 'bypass',
        dangerouslySkipPermissions: true,
      },
      {
        vars: {},
        workingDir,
        projectId: session.projectId,
        sessionId,
        issueId: session.issueId,
      },
    )

    updateExecutionProcess(execRecord.id, {
      status: 'running',
      pid: spawned.subprocess.pid,
    })

    processManager.register(execRecord.id, sessionId, spawned, line =>
      executor.normalizeLog(line))

    return { executionId: execRecord.id, process: spawned }
  }

  async cancelSession(sessionId: string): Promise<void> {
    const active = processManager.getActiveProcesses()
    const sessionProcesses = active.filter(p => p.sessionId === sessionId)
    for (const p of sessionProcesses) {
      await processManager.cancel(p.executionId)
    }
    updateAgentSession(sessionId, { status: 'cancelled' })
  }

  getSession(sessionId: string): AgentSession | undefined {
    return getAgentSession(sessionId)
  }

  getSessionsByProject(projectId: string): AgentSession[] {
    return getAgentSessionsByProject(projectId)
  }

  getSessionLogs(executionId: string): NormalizedLogEntry[] {
    return processManager.getLogs(executionId)
  }
}

// Singleton
export const sessionManager = new SessionManager()
