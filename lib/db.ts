import { Pool } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-serverless'

// Use Neon serverless pool for Vercel/Neon deployments. Keep DATABASE_URL
// server-side only. If DATABASE_URL is absent, we still export a pool/db so
// server routes start; runtime errors will appear when queries run.
const connectionString = process.env.DATABASE_URL ?? ''

if (!connectionString) {
  // Intentionally allow the app to start without a DB during static/local
  // workflows; runtime errors will surface on queries.
}

export const pool = new Pool({ connectionString })

export const db = drizzle(pool)

export default db
