import { Hono } from 'hono'
import { compress } from 'hono/compress'
import { agentRoutes, apiRoutes, sessionRoutes } from './routes'

const app = new Hono()

app.use(compress())
app.route('/api', apiRoutes)
app.route('/api/agents', agentRoutes)
app.route('/api/projects/:projectId/sessions', sessionRoutes)

app.all('/api/*', (c) => {
  return c.json(
    {
      error: 'Not Found',
      code: 'API_NOT_FOUND',
    },
    404,
  )
})

export default app
