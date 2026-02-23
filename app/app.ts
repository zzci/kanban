import { Hono } from 'hono'
import { compress } from 'hono/compress'
import { apiRoutes } from './routes'

const app = new Hono()

app.use(compress())
app.route('/api', apiRoutes)

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
