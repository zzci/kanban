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
type UnsubscribeFn = () => void

const MAX_LOG_ENTRIES = 10000
const AUTO_CLEANUP_DELAY_MS = 5 * 60 * 1000 // 5 minutes

export class ProcessManager {
  private processes = new Map<string, ManagedProcess>()
  private stateChangeCallbacks = new Map<number, StateChangeCallback>()
  private logCallbacks = new Map<number, LogCallback>()
  private cleanupTimers = new Map<string, ReturnType<typeof setTimeout>>()
  private nextCallbackId = 0

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

  cleanup(executionId: string): void {
    // Clear any pending auto-cleanup timer
    const timer = this.cleanupTimers.get(executionId)
    if (timer) {
      clearTimeout(timer)
      this.cleanupTimers.delete(executionId)
    }
    this.processes.delete(executionId)
  }

  onStateChange(callback: StateChangeCallback): UnsubscribeFn {
    const id = this.nextCallbackId++
    this.stateChangeCallbacks.set(id, callback)
    return () => {
      this.stateChangeCallbacks.delete(id)
    }
  }

  onLog(callback: LogCallback): UnsubscribeFn {
    const id = this.nextCallbackId++
    this.logCallbacks.set(id, callback)
    return () => {
      this.logCallbacks.delete(id)
    }
  }

  getLogs(executionId: string): NormalizedLogEntry[] {
    return this.processes.get(executionId)?.logs ?? []
  }

  private scheduleAutoCleanup(executionId: string): void {
    // Clear any existing timer for this execution
    const existing = this.cleanupTimers.get(executionId)
    if (existing) {
      clearTimeout(existing)
    }

    const timer = setTimeout(() => {
      this.cleanupTimers.delete(executionId)
      this.processes.delete(executionId)
    }, AUTO_CLEANUP_DELAY_MS)

    this.cleanupTimers.set(executionId, timer)
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

      if (managed.state === 'cancelled') {
        // Already handled, but still schedule cleanup
        this.scheduleAutoCleanup(executionId)
        return
      }

      managed.state = exitCode === 0 ? 'completed' : 'failed'
      this.emitStateChange(executionId, managed.state)

      // Schedule auto-cleanup for terminal states
      this.scheduleAutoCleanup(executionId)
    }
    catch {
      const managed = this.processes.get(executionId)
      if (managed && managed.state === 'running') {
        managed.state = 'failed'
        managed.finishedAt = new Date()
        this.emitStateChange(executionId, 'failed')
        this.scheduleAutoCleanup(executionId)
      }
    }
  }

  private emitStateChange(executionId: string, state: ProcessStatus): void {
    for (const cb of this.stateChangeCallbacks.values()) {
      try {
        cb(executionId, state)
      }
      catch {
        /* ignore callback errors */
      }
    }
  }

  private emitLog(executionId: string, entry: NormalizedLogEntry): void {
    for (const cb of this.logCallbacks.values()) {
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
