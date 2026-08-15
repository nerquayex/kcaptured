const fs = require('fs')
const path = require('path')
const { Pool } = require('@neondatabase/serverless')

function loadDotEnv(file) {
  if (!fs.existsSync(file)) return
  const content = fs.readFileSync(file, 'utf8')
  for (const line of content.split(/\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq)
    let val = trimmed.slice(eq + 1)
    if ((val.startsWith("\"") && val.endsWith("\"")) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    process.env[key] = val
  }
}

loadDotEnv(path.join(__dirname, '..', '.env.local'))

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL_MISSING')
  process.exit(2)
}

const sqlPath = path.join(__dirname, '..', 'drizzle', 'migrations', '0001_create_portfolio_items.sql')
if (!fs.existsSync(sqlPath)) {
  console.error('MIGRATION_FILE_MISSING')
  process.exit(3)
}

const sql = fs.readFileSync(sqlPath, 'utf8')

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

;(async () => {
  try {
    console.log('Applying migration SQL...')
    await pool.query(sql)
    console.log('MIGRATION_OK')
    await pool.end()
    process.exit(0)
  } catch (err) {
    console.error('MIGRATION_ERROR', String(err.message || err))
    try { await pool.end() } catch (_) {}
    process.exit(4)
  }
})()
