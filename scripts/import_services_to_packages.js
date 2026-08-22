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

function parseServicesFile() {
  const file = path.join(__dirname, '..', 'lib', 'services-data.ts')
  const src = fs.readFileSync(file, 'utf8')
  // crude regex to extract service objects
  const entryRe = /\{[\s\S]*?id:\s*'([^']+)'[\s\S]*?category:\s*'([^']+)'[\s\S]*?name:\s*'([^']+)'[\s\S]*?duration:\s*'([^']+)'[\s\S]*?price:\s*([0-9]+)[\s\S]*?features:\s*\[([\s\S]*?)\][\s\S]*?(?:sampleUrl:\s*'([^']+)')?/g
  const services = []
  let m
  while ((m = entryRe.exec(src)) !== null) {
    const id = m[1]
    const category = m[2]
    const name = m[3]
    const duration = m[4]
    const price = parseInt(m[5], 10)
    const featuresRaw = m[6] || ''
    const sampleUrl = m[7]
    // parse features array items
    const featRe = /'([^']+)'/g
    const feats = []
    let f
    while ((f = featRe.exec(featuresRaw)) !== null) feats.push(f[1])
    services.push({ id, category, name, duration, price, features: feats, sampleUrl })
  }
  return services
}

loadEnv()
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function main() {
  try {
    const services = parseServicesFile()
    if (services.length === 0) {
      console.log('No services parsed from lib/services-data.ts; aborting')
      return
    }

    console.log('Parsed services count:', services.length)

    let inserted = 0
    let updated = 0
    for (const s of services) {
      // upsert by id
      const sql = `INSERT INTO packages (id, category, name, duration, price, features, sample_url, sort_order, active, created_at, updated_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9, now(), now())
        ON CONFLICT (id) DO UPDATE SET category = EXCLUDED.category, name = EXCLUDED.name, duration = EXCLUDED.duration, price = EXCLUDED.price, features = EXCLUDED.features, sample_url = EXCLUDED.sample_url, updated_at = now()`
      const params = [s.id, s.category, s.name, s.duration || null, s.price || 0, JSON.stringify(s.features || []), s.sampleUrl || null, 0, true]
      const res = await pool.query(sql, params)
      if (res.rowCount && res.rowCount > 0) inserted++
      else updated++
      console.log('Upserted', s.id)
    }

    console.log('Done. inserted approx=', inserted, 'updated approx=', updated)
  } catch (e) {
    console.error('ERROR', e && e.message ? e.message : e)
  } finally {
    await pool.end()
  }
}

main()
