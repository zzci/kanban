import { Hono } from 'hono'
import { discoverAgents } from '../agents/discovery'
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

export default agents
