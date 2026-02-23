import type { AgentAvailability, AgentType } from './types'
import { BUILT_IN_PROFILES } from './types'

// Cache with TTL
interface CacheEntry {
  result: AgentAvailability
  expiresAt: number
}
const cache = new Map<AgentType, CacheEntry>()
const DEFAULT_TTL_MS = 5 * 60 * 1000 // 5 minutes

// Agent-specific detection configs
const DETECTION_CONFIG: Record<
  AgentType,
  {
    versionCmd: string[]
    authPaths?: string[]
    authEnvVars?: string[]
  }
> = {
  'claude-code': {
    versionCmd: ['claude', '--version'],
    authPaths: ['~/.claude.json'],
  },
  'codex': {
    versionCmd: ['npx', '-y', '@openai/codex@latest', '--version'],
    authPaths: ['~/.codex/'],
    authEnvVars: ['OPENAI_API_KEY'],
  },
  'gemini': {
    versionCmd: ['npx', '-y', '@google/gemini-cli@latest', '--version'],
    authPaths: ['~/.gemini/oauth_creds.json'],
    authEnvVars: ['GOOGLE_API_KEY', 'GEMINI_API_KEY'],
  },
}

// Helper: expand ~ to home directory
function expandHome(path: string): string {
  if (path.startsWith('~/')) {
    const home = process.env.HOME ?? process.env.USERPROFILE ?? '/root'
    return path.replace('~/', `${home}/`)
  }
  return path
}

// Helper: check if file/directory exists
async function pathExists(path: string): Promise<boolean> {
  try {
    const file = Bun.file(expandHome(path))
    return await file.exists()
  }
  catch {
    return false
  }
}

// Helper: run command with timeout and get output
async function runCommand(
  cmd: string[],
  timeoutMs = 5000,
): Promise<{ stdout: string, exitCode: number } | null> {
  try {
    const proc = Bun.spawn(cmd, {
      stdout: 'pipe',
      stderr: 'pipe',
      env: { ...process.env, NPM_CONFIG_LOGLEVEL: 'error' },
    })

    const timer = setTimeout(() => proc.kill(), timeoutMs)

    const exitCode = await proc.exited
    clearTimeout(timer)

    const stdout = await new Response(proc.stdout).text()
    return { stdout: stdout.trim(), exitCode }
  }
  catch {
    return null
  }
}

// Discover single agent
export async function discoverAgent(agentType: AgentType): Promise<AgentAvailability> {
  // Check cache first
  const cached = cache.get(agentType)
  if (cached && Date.now() < cached.expiresAt) {
    return cached.result
  }

  const config = DETECTION_CONFIG[agentType]
  if (!config) {
    return { agentType, installed: false, authStatus: 'unknown', error: 'Unknown agent type' }
  }

  // Check binary / version
  const versionResult = await runCommand(config.versionCmd)
  if (!versionResult || versionResult.exitCode !== 0) {
    const result: AgentAvailability = { agentType, installed: false, authStatus: 'unknown' }
    cache.set(agentType, { result, expiresAt: Date.now() + DEFAULT_TTL_MS })
    return result
  }

  // Parse version from output (take first line, extract semver-like pattern)
  const versionMatch = versionResult.stdout.match(/(\d+\.\d+\.\d[\w.-]*)/)
  const version = versionMatch?.[1]

  // Try to resolve binary path
  const binaryName = config.versionCmd[0]!
  const binaryPath = Bun.which(binaryName) ?? undefined

  // Check auth status
  let authStatus: AgentAvailability['authStatus'] = 'unknown'

  if (config.authEnvVars?.length) {
    const hasEnvAuth = config.authEnvVars.some(v => !!process.env[v])
    authStatus = hasEnvAuth ? 'authenticated' : 'unauthenticated'
  }

  if (config.authPaths?.length) {
    const authPathExists = await Promise.all(config.authPaths.map(pathExists))
    if (authPathExists.some(Boolean)) {
      authStatus = 'authenticated'
    }
    else if (authStatus === 'unknown') {
      authStatus = 'unauthenticated'
    }
  }

  const result: AgentAvailability = {
    agentType,
    installed: true,
    version,
    binaryPath,
    authStatus,
  }

  cache.set(agentType, { result, expiresAt: Date.now() + DEFAULT_TTL_MS })
  return result
}

// Discover all agents (parallel)
export async function discoverAgents(): Promise<AgentAvailability[]> {
  const agentTypes = Object.keys(BUILT_IN_PROFILES) as AgentType[]
  return Promise.all(agentTypes.map(discoverAgent))
}

// Clear the discovery cache
export function clearDiscoveryCache(): void {
  cache.clear()
}
