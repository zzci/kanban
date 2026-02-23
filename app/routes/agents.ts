import type { AgentType } from '../agents/types'
import { Hono } from 'hono'
import { discoverAgents } from '../agents/discovery'
import { agentRegistry } from '../agents/executors'
import { BUILT_IN_PROFILES } from '../agents/types'

const agents = new Hono()

// GET /api/agents/available — List detected agents
agents.get('/available', async (c) => {
  const availability = await discoverAgents()
  return c.json({ success: true, data: availability })
})

// GET /api/agents/profiles — List agent profiles
agents.get('/profiles', (c) => {
  const profiles = Object.values(BUILT_IN_PROFILES)
  return c.json({ success: true, data: profiles })
})

// GET /api/agents/:agentType/models — List available models for an agent
agents.get('/:agentType/models', async (c) => {
  const agentType = c.req.param('agentType') as AgentType
  const executor = agentRegistry.get(agentType)
  if (!executor) {
    return c.json({ success: false, error: `Unknown agent type: ${agentType}` }, 404)
  }

  const models = await agentRegistry.getModels(agentType)
  const profile = BUILT_IN_PROFILES[agentType]
  return c.json({
    success: true,
    data: { agentType, defaultModel: profile?.defaultModel, models },
  })
})

export default agents
