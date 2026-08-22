const fs = require('fs')
const path = require('path')
const { Pool } = require('@neondatabase/serverless')
for (const line of fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8').split(/\r?\n/)) {
  const i = line.indexOf('=')
  if (i > 0) process.env[line.slice(0, i)] = line.slice(i + 1).replace(/^['"]|['"]$/g, '')
}
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
;(async () => {
  for (const table of ['site_settings', 'audit_logs']) {
    const result = await pool.query(`SELECT count(*)::int AS count FROM ${table}`)
    console.log(`${table}: ${result.rows[0].count}`)
  }
  await pool.end()
})().catch(async (error) => { console.error(error.message); await pool.end(); process.exit(1) })
