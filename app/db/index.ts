import { existsSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Database } from 'bun:sqlite'
import { sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/bun-sqlite'
import { migrate } from 'drizzle-orm/bun-sqlite/migrator'
import * as schema from './schema'

const moduleDir
  = typeof import.meta.dir === 'string'
    ? import.meta.dir
    : dirname(fileURLToPath(import.meta.url))

const rawDbPath = process.env.DB_PATH || 'data/kanban.db'
const dbPath = rawDbPath.startsWith('/')
  ? rawDbPath
  : resolve(moduleDir, '../../', rawDbPath)

const dir = dirname(dbPath)
if (!existsSync(dir)) {
  mkdirSync(dir, { recursive: true })
}

const sqlite = new Database(dbPath)
sqlite.run('PRAGMA journal_mode = WAL')
sqlite.run('PRAGMA foreign_keys = ON')
sqlite.run('PRAGMA busy_timeout = 15000')
sqlite.run('PRAGMA synchronous = NORMAL')
sqlite.run('PRAGMA cache_size = -64000')
sqlite.run('PRAGMA mmap_size = 268435456')

export const db = drizzle({ client: sqlite, schema })
export { dbPath, sqlite }

try {
  migrate(db, { migrationsFolder: resolve(moduleDir, '../../drizzle') })
}
catch (err: any) {
  const msg = String(err?.message) + String(err?.cause?.message ?? '')
  if (!msg.includes('already exists')) {
    throw err
  }
}

export async function checkDbHealth() {
  // Use native sqlite check for predictable health signal in Bun runtime.
  const result = sqlite.query('select 1 as ok').get() as { ok?: number } | null
  // Touch drizzle connection path as well.
  await db.get(sql`select 1 as ok`)
  return {
    ok: Number(result?.ok ?? 0) === 1,
  }
}
