import type { AgentAvailability, AgentExecutor, AgentRegistry, AgentType } from '../types'
import { ClaudeCodeExecutor } from './claude'
import { CodexExecutor } from './codex'
import { GeminiExecutor } from './gemini'

// Re-export executor classes
export { ClaudeCodeExecutor } from './claude'
export { CodexExecutor } from './codex'
export { GeminiExecutor } from './gemini'

/**
 * Default agent registry — manages all executor instances.
 */
class DefaultAgentRegistry implements AgentRegistry {
  private executors = new Map<AgentType, AgentExecutor>()

  register(executor: AgentExecutor): void {
    this.executors.set(executor.agentType, executor)
  }

  get(agentType: AgentType): AgentExecutor | undefined {
    return this.executors.get(agentType)
  }

  getAll(): AgentExecutor[] {
    return [...this.executors.values()]
  }

  async getAvailable(): Promise<AgentAvailability[]> {
    const results = await Promise.all(
      this.getAll().map(executor => executor.getAvailability()),
    )
    return results
  }
}

// Create and populate the singleton registry
export const agentRegistry: AgentRegistry = createRegistry()

function createRegistry(): AgentRegistry {
  const registry = new DefaultAgentRegistry()

  // Register all supported executors
  registry.register(new ClaudeCodeExecutor())
  registry.register(new CodexExecutor())
  registry.register(new GeminiExecutor())

  return registry
}
