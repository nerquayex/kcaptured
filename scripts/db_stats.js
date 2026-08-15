const fs = require('fs')
const path = require('path')

const envFile = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envFile)) {
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

const { Pool } = require('@neondatabase/serverless')
;(async () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  try {
    const r = await pool.query('SELECT COUNT(*) as cnt FROM portfolio_items')
    console.log('count', r.rows[0].cnt)
    const dup = await pool.query("SELECT public_id, count(*) as c FROM portfolio_items GROUP BY public_id HAVING count(*)>1")
    console.log('dups', dup.rows)
    const sample = await pool.query('SELECT id, public_id, cloudinary_url, category, title, sort_order, featured, active FROM portfolio_items ORDER BY created_at DESC LIMIT 5')
    console.log('sample', sample.rows)
  } catch (e) {
    console.error(e)
  } finally {
    await pool.end()
  }
})()
