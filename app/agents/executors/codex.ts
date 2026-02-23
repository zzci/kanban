import type {
  AgentAvailability,
  AgentCapability,
  AgentExecutor,
  ExecutionEnv,
  FollowUpOptions,
  NormalizedLogEntry,
  SpawnedProcess,
  SpawnOptions,
} from '../types'

const _BASE_COMMAND = 'npx -y @openai/codex@latest'

/**
 * Codex executor — uses JSON-RPC protocol via `app-server` mode.
 *
 * Launch: `npx -y @openai/codex@latest app-server --port <port>`
 * Communication: JSON-RPC over HTTP (localhost)
 *
 * TODO: Implement spawn/follow-up when Codex CLI stabilizes.
 */
export class CodexExecutor implements AgentExecutor {
  readonly agentType = 'codex' as const
  readonly protocol = 'json-rpc' as const
  readonly capabilities: AgentCapability[] = [
    'session-fork',
    'setup-helper',
    'context-usage',
    'sandbox',
    'reasoning',
  ]

  async spawn(_options: SpawnOptions, _env: ExecutionEnv): Promise<SpawnedProcess> {
    // TODO: Implement Codex app-server spawn
    // 1. Start `npx -y @openai/codex@latest app-server --port <port>`
    // 2. Wait for server ready signal
    // 3. Send initial prompt via JSON-RPC
    throw new Error('Codex executor not yet implemented')
  }

  async spawnFollowUp(_options: FollowUpOptions, _env: ExecutionEnv): Promise<SpawnedProcess> {
    // TODO: Implement follow-up via JSON-RPC session continuation
    throw new Error('Codex follow-up not yet implemented')
  }

  async cancel(spawnedProcess: SpawnedProcess): Promise<void> {
    spawnedProcess.cancel()
    const timeout = setTimeout(() => {
      try {
        spawnedProcess.subprocess.kill(9)
      }
      catch {
        /* already dead */
      }
    }, 5000)

    try {
      await spawnedProcess.subprocess.exited
    }
    finally {
      clearTimeout(timeout)
    }
  }

  async getAvailability(): Promise<AgentAvailability> {
    try {
      const proc = Bun.spawn(['npx', '-y', '@openai/codex@latest', '--version'], {
        stdout: 'pipe',
        stderr: 'pipe',
        env: { ...process.env, NPM_CONFIG_LOGLEVEL: 'error' },
      })

      const timer = setTimeout(() => proc.kill(), 10000)
      const exitCode = await proc.exited
      clearTimeout(timer)

      if (exitCode !== 0) {
        return { agentType: 'codex', installed: false, authStatus: 'unknown' }
      }

      const stdout = await new Response(proc.stdout).text()
      const versionMatch = stdout.match(/(\d+\.\d+\.\d[\w.-]*)/)
      const version = versionMatch?.[1]

      // Check auth — OPENAI_API_KEY or ~/.codex/
      let authStatus: AgentAvailability['authStatus'] = 'unknown'
      if (process.env.OPENAI_API_KEY) {
        authStatus = 'authenticated'
      }
      else {
        const home = process.env.HOME ?? '/root'
        const configFile = Bun.file(`${home}/.codex/`)
        if (await configFile.exists()) {
          authStatus = 'authenticated'
        }
        else {
          authStatus = 'unauthenticated'
        }
      }

      return {
        agentType: 'codex',
        installed: true,
        version,
        authStatus,
      }
    }
    catch (error) {
      return {
        agentType: 'codex',
        installed: false,
        authStatus: 'unknown',
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  normalizeLog(rawLine: string): NormalizedLogEntry | null {
    // TODO: Implement JSON-RPC log normalization for Codex
    // Codex uses JSON-RPC messages, need to parse and normalize
    try {
      const data = JSON.parse(rawLine)

      // JSON-RPC response
      if (data.jsonrpc === '2.0') {
        if (data.error) {
          return {
            entryType: 'error-message',
            content: data.error.message ?? 'Unknown JSON-RPC error',
            timestamp: new Date().toISOString(),
            metadata: { code: data.error.code },
          }
        }
        if (data.result) {
          return {
            entryType: 'assistant-message',
            content: typeof data.result === 'string' ? data.result : JSON.stringify(data.result),
            timestamp: new Date().toISOString(),
            metadata: { id: data.id },
          }
        }
      }

      return null
    }
    catch {
      if (rawLine.trim()) {
        return {
          entryType: 'system-message',
          content: rawLine,
        }
      }
      return null
    }
  }
}
