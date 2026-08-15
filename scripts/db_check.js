const { Pool } = require('@neondatabase/serverless')
const fs = require('fs')
const path = require('path')

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

// Load .env.local so this script can run in CI/local shells
loadDotEnv(path.join(__dirname, '..', '.env.local'))

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL_MISSING')
  process.exit(2)
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

;(async () => {
  try {
    // Check table existence
    const existsRes = await pool.query("SELECT to_regclass('public.portfolio_items') as regclass")
    const exists = existsRes.rows[0].regclass !== null
    console.log(JSON.stringify({ table_exists: exists }))

    if (exists) {
      const cols = await pool.query(`SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'portfolio_items'
        ORDER BY ordinal_position`)
      console.log(JSON.stringify({ columns: cols.rows }))

      const cnt = await pool.query('SELECT COUNT(*)::int as count FROM public.portfolio_items')
      console.log(JSON.stringify({ row_count: Number(cnt.rows[0].count) }))
    }

    await pool.end()
    process.exit(0)
  } catch (err) {
    console.error(JSON.stringify({ error: String(err.message || err) }))
    try { await pool.end() } catch (_) {}
    process.exit(3)
  }
})()
