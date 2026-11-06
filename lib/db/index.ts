import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

const globalDb = globalThis as typeof globalThis & { gymbroPool?: Pool }

// Reuse connections across route bundles and development hot reloads.
export const pool = globalDb.gymbroPool ?? new Pool({
  connectionString: process.env.DATABASE_URL,
})
globalDb.gymbroPool = pool

export const db = drizzle(pool, { schema })
