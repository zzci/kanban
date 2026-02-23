import type {
  AgentAvailability,
  AgentCapability,
  AgentExecutor,
  ExecutionEnv,
  FollowUpOptions,
  NormalizedLogEntry,
  SpawnedProcess,
  SpawnOptions,
  ToolAction,
} from '../types'
import { CommandBuilder } from '../command'

const BASE_COMMAND = 'npx -y @anthropic-ai/claude-code@latest'

export class ClaudeCodeExecutor implements AgentExecutor {
  readonly agentType = 'claude-code' as const
  readonly protocol = 'stream-json' as const
  readonly capabilities: AgentCapability[] = ['session-fork', 'context-usage', 'plan-mode']

  async spawn(options: SpawnOptions, env: ExecutionEnv): Promise<SpawnedProcess> {
    const builder = CommandBuilder.create(BASE_COMMAND)
      .params(['-p', '--output-format=stream-json', '--verbose'])
      .param('--input-format', 'stream-json')
      .env('NPM_CONFIG_LOGLEVEL', 'error')
      .cwd(options.workingDir)

    if (options.model) {
      builder.param('--model', options.model)
    }

    if (options.dangerouslySkipPermissions) {
      builder.param('--dangerously-skip-permissions')
    }
    else if (options.permissionMode === 'bypass') {
      builder.param('--permission-mode', 'bypass_permissions')
    }
    else if (options.permissionMode === 'plan') {
      builder.param('--permission-mode', 'plan')
    }

    if (options.agent) {
      builder.param('--agent', options.agent)
    }

    // Disable interactive questions
    builder.param('--disallowedTools', 'AskUserQuestion')

    // Apply environment variables
    if (options.env) {
      builder.envs(options.env)
    }
    if (env.vars) {
      builder.envs(env.vars)
    }

    const cmd = builder.build()

    const proc = Bun.spawn([cmd.program, ...cmd.args], {
      cwd: cmd.cwd ?? options.workingDir,
      stdin: 'pipe',
      stdout: 'pipe',
      stderr: 'pipe',
      env: { ...process.env, ...cmd.env },
    })

    // Send the prompt via stdin (Bun's stdin is a FileSink)
    const message = JSON.stringify({
      type: 'user',
      content: options.prompt,
    })
    proc.stdin.write(`${message}\n`)
    proc.stdin.end()

    return {
      subprocess: proc,
      stdout: proc.stdout as ReadableStream<Uint8Array>,
      stderr: proc.stderr as ReadableStream<Uint8Array>,
      cancel: () => {
        proc.kill()
      },
    }
  }

  async spawnFollowUp(options: FollowUpOptions, env: ExecutionEnv): Promise<SpawnedProcess> {
    const builder = CommandBuilder.create(BASE_COMMAND)
      .params(['-p', '--output-format=stream-json', '--verbose'])
      .param('--input-format', 'stream-json')
      .param('--resume', options.sessionId)
      .env('NPM_CONFIG_LOGLEVEL', 'error')
      .cwd(options.workingDir)

    if (options.resetToMessageId) {
      builder.param('--resume-session-at', options.resetToMessageId)
    }

    if (options.model) {
      builder.param('--model', options.model)
    }

    if (options.dangerouslySkipPermissions) {
      builder.param('--dangerously-skip-permissions')
    }
    else if (options.permissionMode === 'bypass') {
      builder.param('--permission-mode', 'bypass_permissions')
    }

    if (options.env) {
      builder.envs(options.env)
    }
    if (env.vars) {
      builder.envs(env.vars)
    }

    const cmd = builder.build()

    const proc = Bun.spawn([cmd.program, ...cmd.args], {
      cwd: cmd.cwd ?? options.workingDir,
      stdin: 'pipe',
      stdout: 'pipe',
      stderr: 'pipe',
      env: { ...process.env, ...cmd.env },
    })

    // Send follow-up prompt (Bun's stdin is a FileSink)
    const message = JSON.stringify({
      type: 'user',
      content: options.prompt,
    })
    proc.stdin.write(`${message}\n`)
    proc.stdin.end()

    return {
      subprocess: proc,
      stdout: proc.stdout as ReadableStream<Uint8Array>,
      stderr: proc.stderr as ReadableStream<Uint8Array>,
      cancel: () => proc.kill(),
    }
  }

  async cancel(spawnedProcess: SpawnedProcess): Promise<void> {
    spawnedProcess.cancel()
    // Wait for process to exit, with 5s timeout before SIGKILL
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
      // Try `claude --version` first (globally installed)
      let proc = Bun.spawn(['claude', '--version'], {
        stdout: 'pipe',
        stderr: 'pipe',
      })

      let exitCode = await proc.exited
      let stdout = ''

      if (exitCode === 0) {
        stdout = await new Response(proc.stdout).text()
      }
      else {
        // Fall back to npx
        proc = Bun.spawn(['npx', '-y', '@anthropic-ai/claude-code@latest', '--version'], {
          stdout: 'pipe',
          stderr: 'pipe',
          env: { ...process.env, NPM_CONFIG_LOGLEVEL: 'error' },
        })

        const timer = setTimeout(() => proc.kill(), 10000)
        exitCode = await proc.exited
        clearTimeout(timer)

        if (exitCode === 0) {
          stdout = await new Response(proc.stdout).text()
        }
      }

      if (exitCode !== 0) {
        return { agentType: 'claude-code', installed: false, authStatus: 'unknown' }
      }

      const versionMatch = stdout.match(/(\d+\.\d+\.\d[\w.-]*)/)
      const version = versionMatch?.[1]
      const binaryPath = Bun.which('claude') ?? undefined

      // Check auth - look for ANTHROPIC_API_KEY or ~/.claude.json
      let authStatus: AgentAvailability['authStatus'] = 'unknown'
      if (process.env.ANTHROPIC_API_KEY) {
        authStatus = 'authenticated'
      }
      else {
        const home = process.env.HOME ?? '/root'
        const configFile = Bun.file(`${home}/.claude.json`)
        if (await configFile.exists()) {
          authStatus = 'authenticated'
        }
        else {
          authStatus = 'unauthenticated'
        }
      }

      return {
        agentType: 'claude-code',
        installed: true,
        version,
        binaryPath,
        authStatus,
      }
    }
    catch (error) {
      return {
        agentType: 'claude-code',
        installed: false,
        authStatus: 'unknown',
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  normalizeLog(rawLine: string): NormalizedLogEntry | null {
    try {
      const data = JSON.parse(rawLine)

      // Handle different Claude Code stream-json message types
      switch (data.type) {
        case 'assistant': {
          const content = extractTextContent(data.message?.content)
          if (!content)
            return null
          return {
            entryType: 'assistant-message',
            content,
            timestamp: data.timestamp,
            metadata: { messageId: data.message?.id },
          }
        }

        case 'content_block_delta': {
          if (data.delta?.type === 'text_delta') {
            return {
              entryType: 'assistant-message',
              content: data.delta.text ?? '',
              timestamp: data.timestamp,
            }
          }
          if (data.delta?.type === 'thinking_delta') {
            return {
              entryType: 'thinking',
              content: data.delta.thinking ?? '',
              timestamp: data.timestamp,
            }
          }
          return null
        }

        case 'tool_use': {
          const toolAction = classifyToolAction(data.name, data.input)
          return {
            entryType: 'tool-use',
            content: `Tool: ${data.name}`,
            timestamp: data.timestamp,
            metadata: { toolName: data.name, input: data.input, toolCallId: data.id },
            toolAction,
          }
        }

        case 'tool_result': {
          return {
            entryType: 'tool-use',
            content: typeof data.content === 'string' ? data.content : JSON.stringify(data.content),
            timestamp: data.timestamp,
            metadata: { toolCallId: data.tool_use_id, isResult: true },
          }
        }

        case 'error': {
          return {
            entryType: 'error-message',
            content: data.error?.message ?? data.message ?? 'Unknown error',
            timestamp: data.timestamp,
            metadata: { errorType: data.error?.type },
          }
        }

        case 'system': {
          return {
            entryType: 'system-message',
            content: data.message ?? data.content ?? '',
            timestamp: data.timestamp,
          }
        }

        case 'result': {
          const content = extractTextContent(data.result)
          return {
            entryType: 'assistant-message',
            content: content ?? '',
            timestamp: data.timestamp,
            metadata: {
              sessionId: data.session_id,
              costUsd: data.cost_usd,
              inputTokens: data.input_tokens,
              outputTokens: data.output_tokens,
              duration: data.duration_ms,
            },
          }
        }

        default:
          return null
      }
    }
    catch {
      // Not JSON or parse error - treat as plain text
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

// Helper: extract text content from Claude message content array
function extractTextContent(content: unknown): string | null {
  if (typeof content === 'string')
    return content
  if (Array.isArray(content)) {
    return content
      .filter((block: { type: string }) => block.type === 'text')
      .map((block: { text: string }) => block.text)
      .join('')
  }
  return null
}

// Helper: classify tool action
function classifyToolAction(toolName: string, input: Record<string, unknown>): ToolAction {
  switch (toolName) {
    case 'Read':
      return { kind: 'file-read', path: String(input.file_path ?? input.path ?? '') }
    case 'Write':
    case 'Edit':
      return { kind: 'file-edit', path: String(input.file_path ?? input.path ?? '') }
    case 'Bash':
      return {
        kind: 'command-run',
        command: String(input.command ?? ''),
        category: classifyCommand(String(input.command ?? '')),
      }
    case 'Grep':
    case 'Glob':
      return { kind: 'search', query: String(input.pattern ?? input.query ?? '') }
    case 'WebFetch':
      return { kind: 'web-fetch', url: String(input.url ?? '') }
    default:
      return { kind: 'tool', toolName, arguments: input }
  }
}

// Helper: classify shell commands
function classifyCommand(command: string): 'read' | 'search' | 'edit' | 'fetch' | 'other' {
  const cmd = command.trim().split(/\s+/)[0] ?? ''
  if (['cat', 'head', 'tail', 'ls', 'less', 'more'].includes(cmd))
    return 'read'
  if (['grep', 'rg', 'find', 'awk', 'ag'].includes(cmd))
    return 'search'
  if (command.includes('>') || ['sed', 'rm', 'mv', 'cp', 'mkdir', 'touch'].includes(cmd))
    return 'edit'
  if (['curl', 'wget'].includes(cmd))
    return 'fetch'
  return 'other'
}
