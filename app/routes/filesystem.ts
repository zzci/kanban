import { Hono } from 'hono'
import { readdir } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'

const filesystem = new Hono()

filesystem.get('/dirs', async (c) => {
  const raw = c.req.query('path') || process.cwd()
  const current = resolve(raw)
  const parent = dirname(current) !== current ? dirname(current) : null

  try {
    const entries = await readdir(current, { withFileTypes: true })
    const dirs = entries
      .filter((e) => e.isDirectory() && !e.name.startsWith('.'))
      .map((e) => e.name)
      .sort((a, b) => a.localeCompare(b))

    return c.json({
      success: true,
      data: { current, parent, dirs },
    })
  }
  catch {
    return c.json({
      success: true,
      data: { current, parent, dirs: [] },
    })
  }
})

export default filesystem
