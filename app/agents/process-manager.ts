import type { NormalizedLogEntry, ProcessStatus, SpawnedProcess } from './types'
import { normalizeStream } from './logs'

export interface ManagedProcess {
  executionId: string
  sessionId: string
  process: SpawnedProcess
  state: ProcessStatus
  startedAt: Date
  finishedAt?: Date
  exitCode?: number
  logs: NormalizedLogEntry[]
}

type StateChangeCallback = (executionId: string, state: ProcessStatus) => void
type LogCallback = (executionId: string, entry: NormalizedLogEntry) => void

const MAX_LOG_ENTRIES = 10000

export class ProcessManager {
  private processes = new Map<string, ManagedProcess>()
  private stateChangeCallbacks: StateChangeCallback[] = []
  private logCallbacks: LogCallback[] = []

  register(
    executionId: string,
    sessionId: string,
    process: SpawnedProcess,
    logParser: (line: string) => NormalizedLogEntry | null,
  ): ManagedProcess {
    const managed: ManagedProcess = {
      executionId,
      sessionId,
      process,
      state: 'running',
      startedAt: new Date(),
      logs: [],
    }

    this.processes.set(executionId, managed)
    this.emitStateChange(executionId, 'running')

    // Start consuming stdout for log normalization
    this.consumeStream(executionId, process.stdout, logParser)

    // Monitor process exit
    this.monitorExit(executionId, process)

    return managed
  }

  getProcess(executionId: string): ManagedProcess | undefined {
    return this.processes.get(executionId)
  }

  getActiveProcesses(): ManagedProcess[] {
    return Array.from(this.processes.values()).filter(
      p => p.state === 'running' || p.state === 'spawning',
    )
  }

  async cancel(executionId: string): Promise<void> {
    const managed = this.processes.get(executionId)
    if (!managed || managed.state !== 'running')
      return

    managed.state = 'cancelled'
    this.emitStateChange(executionId, 'cancelled')

    // SIGTERM first
    managed.process.cancel()

    // Wait up to 5s, then SIGKILL
    const killTimeout = setTimeout(() => {
      try {
        managed.process.subprocess.kill(9)
      }
      catch {
        /* already dead */
      }
    }, 5000)

    try {
      await managed.process.subprocess.exited
    }
    catch {
      /* ignore */
    }
    finally {
      clearTimeout(killTimeout)
      managed.finishedAt = new Date()
    }
  }

  async cancelAll(): Promise<void> {
    const active = this.getActiveProcesses()
    await Promise.all(active.map(p => this.cancel(p.executionId)))
  }

  onStateChange(callback: StateChangeCallback): void {
    this.stateChangeCallbacks.push(callback)
  }

  onLog(callback: LogCallback): void {
    this.logCallbacks.push(callback)
  }

  getLogs(executionId: string): NormalizedLogEntry[] {
    return this.processes.get(executionId)?.logs ?? []
  }

  private async consumeStream(
    executionId: string,
    stream: ReadableStream<Uint8Array>,
    parser: (line: string) => NormalizedLogEntry | null,
  ): Promise<void> {
    try {
      for await (const entry of normalizeStream(stream, parser)) {
        const managed = this.processes.get(executionId)
        if (!managed)
          break

        // Cap log entries
        if (managed.logs.length < MAX_LOG_ENTRIES) {
          managed.logs.push(entry)
        }

        this.emitLog(executionId, entry)
      }
    }
    catch (error) {
      // Stream closed or error — log it
      const managed = this.processes.get(executionId)
      if (managed) {
        const errorEntry: NormalizedLogEntry = {
          entryType: 'error-message',
          content: error instanceof Error ? error.message : 'Stream read error',
          timestamp: new Date().toISOString(),
        }
        managed.logs.push(errorEntry)
        this.emitLog(executionId, errorEntry)
      }
    }
  }

  private async monitorExit(executionId: string, process: SpawnedProcess): Promise<void> {
    try {
      const exitCode = await process.subprocess.exited
      const managed = this.processes.get(executionId)
      if (!managed)
        return

      managed.exitCode = exitCode
      managed.finishedAt = new Date()

      if (managed.state === 'cancelled')
        return // Already handled

      managed.state = exitCode === 0 ? 'completed' : 'failed'
      this.emitStateChange(executionId, managed.state)
    }
    catch {
      const managed = this.processes.get(executionId)
      if (managed && managed.state === 'running') {
        managed.state = 'failed'
        managed.finishedAt = new Date()
        this.emitStateChange(executionId, 'failed')
      }
    }
  }

  private emitStateChange(executionId: string, state: ProcessStatus): void {
    for (const cb of this.stateChangeCallbacks) {
      try {
        cb(executionId, state)
      }
      catch {
        /* ignore callback errors */
      }
    }
  }

  private emitLog(executionId: string, entry: NormalizedLogEntry): void {
    for (const cb of this.logCallbacks) {
      try {
        cb(executionId, entry)
      }
      catch {
        /* ignore callback errors */
      }
    }
  }
}

// Singleton instance
export const processManager = new ProcessManager()

// Cleanup on server shutdown
process.on('SIGINT', async () => {
  await processManager.cancelAll()
})
process.on('SIGTERM', async () => {
  await processManager.cancelAll()
})
