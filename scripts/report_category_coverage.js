const fs = require('fs')
const path = require('path')
const { Pool } = require('@neondatabase/serverless')

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

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function main() {
  try {
    const staticFile = fs.readFileSync(path.join(__dirname, '..', 'lib', 'portfolio-data.ts'), 'utf8')
    const cats = Array.from(new Set((staticFile.match(/category:\s*'([^']+)'/g) || []).map((s) => s.replace(/category:\s*'/, '').replace("'", ''))))
    console.log('Static categories:', cats)

    const total = await pool.query('SELECT count(*) as cnt from portfolio_items')
    console.log('Total DB records:', total.rows[0].cnt)

    const inSet = await pool.query('SELECT count(*) as cnt FROM portfolio_items WHERE category = ANY($1::text[])', [cats])
    console.log('Records with category in static list:', inSet.rows[0].cnt)

    const others = await pool.query('SELECT id, public_id, category FROM portfolio_items WHERE NOT (category = ANY($1::text[])) ORDER BY category NULLS FIRST LIMIT 100', [cats])
    console.log('Unmapped sample (<=100):', others.rows)
  } catch (e) {
    console.error(e)
  } finally {
    await pool.end()
  }
}

main()
