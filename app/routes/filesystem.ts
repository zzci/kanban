import { readdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { Hono } from 'hono'

const filesystem = new Hono()

function getAllowedRoot(): string {
  return resolve(process.env.PROJECTS_ROOT ?? process.cwd())
}

function isWithinAllowedRoot(targetPath: string): boolean {
  const allowed = getAllowedRoot()
  const resolved = resolve(targetPath)
  return resolved === allowed || resolved.startsWith(`${allowed}/`)
}

filesystem.get('/dirs', async (c) => {
  const raw = c.req.query('path') || process.cwd()
  const current = resolve(raw)

  // SEC-002: Validate path is within allowed root
  if (!isWithinAllowedRoot(current)) {
    return c.json({ success: false, error: 'Access denied' }, 403)
  }

  const parent = dirname(current) !== current ? dirname(current) : null

  try {
    const entries = await readdir(current, { withFileTypes: true })
    const dirs = entries
      .filter(e => e.isDirectory() && !e.name.startsWith('.'))
      .map(e => e.name)
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
