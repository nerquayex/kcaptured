import { Pool } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'

// Minimal, lazily-initialized DB connection for Drizzle
const connectionString = process.env.DATABASE_URL ?? ''

if (!connectionString) {
  // In local dev we prefer the app to start; connection errors will surface
  // at runtime when queries are executed. Keep this file minimal and safe.
}

export const pool = new Pool({ connectionString })

export const db = drizzle(pool)

export default db
