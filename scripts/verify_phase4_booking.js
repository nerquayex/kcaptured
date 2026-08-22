const fs = require('fs')
const path = require('path')
const { Pool } = require('@neondatabase/serverless')

for (const line of fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8').split(/\r?\n/)) {
  const separator = line.indexOf('=')
  if (separator > 0) process.env[line.slice(0, separator)] = line.slice(separator + 1).replace(/^['"]|['"]$/g, '')
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
;(async () => {
  const row = await pool.query("SELECT id, status FROM bookings WHERE client_name = 'Phase 4 Validation' ORDER BY created_at DESC LIMIT 1")
  console.log('booking db row:', row.rows[0] ?? null)
  await pool.query("DELETE FROM bookings WHERE client_name = 'Phase 4 Validation'")
  await pool.end()
})().catch(async (error) => {
  console.error(error.message)
  await pool.end()
  process.exit(1)
})
