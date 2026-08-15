const fs = require('fs')
const path = require('path')
const { Pool } = require('@neondatabase/serverless')

function loadEnv() {
  const envFile = path.join(__dirname, '..', '.env.local')
  if (!fs.existsSync(envFile)) return
  const env = fs.readFileSync(envFile, 'utf8')
  env.split(/\n/).forEach((l) => {
    const t = l.trim()
    if (!t || t.startsWith('#')) return
    const i = t.indexOf('=')
    if (i === -1) return
    let v = t.slice(i + 1)
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1)
    process.env[t.slice(0, i)] = v
  })
}

loadEnv()
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function main() {
  try {
    const res = await pool.query('SELECT count(*)::int AS cnt FROM packages')
    console.log('packages count:', res.rows[0].cnt)
    const rows = await pool.query('SELECT id, name, category, price FROM packages ORDER BY sort_order ASC LIMIT 20')
    console.log('sample rows:', rows.rows)
  } catch (e) {
    console.error('ERROR querying packages:', e && e.message ? e.message : e)
  } finally {
    await pool.end()
  }
}

main()
