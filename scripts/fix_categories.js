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

function derivePublicIdFromUrl(url) {
  try {
    let u = String(url)
    const uploadIdx = u.indexOf('/upload/')
    if (uploadIdx !== -1) {
      u = u.slice(uploadIdx + '/upload/'.length)
    }
    u = u.replace(/^.*?v\d+\//, '')
    u = u.split('?')[0].replace(/\.[a-zA-Z0-9]+$/, '')
    return u
  } catch (e) {
    return String(url)
  }
}

loadEnv()
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function main() {
  try {
    const staticFile = fs.readFileSync(path.join(__dirname, '..', 'lib', 'portfolio-data.ts'), 'utf8')
    const entryRegex = /\{[\s\S]*?category:\s*'([^']+)'[\s\S]*?cloudinaryUrl:\s*'([^']+)'[\s\S]*?id:\s*'([^']+)'/g
    const map = new Map()
    let m
    while ((m = entryRegex.exec(staticFile)) !== null) {
      const category = m[1]
      const url = m[2]
      const id = m[3]
      const publicId = derivePublicIdFromUrl(url)
      map.set(publicId, { category, url, id })
    }

    console.log('Static entries mapped:', map.size)

    // Find DB rows matching these publicIds
    const keys = Array.from(map.keys())
    if (keys.length === 0) {
      console.log('No static entries found; exiting')
      return
    }

    // Query DB for rows with public_id in keys
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(',')
    const sql = `SELECT id, public_id, cloudinary_url, category FROM portfolio_items WHERE public_id IN (${placeholders})`
    const res = await pool.query(sql, keys)
    console.log('DB rows matching static public_ids:', res.rowCount)

    let updated = 0
    const unable = []
    for (const row of res.rows) {
      const publicId = row.public_id
      const target = map.get(publicId)
      if (!target) {
        unable.push({ row, reason: 'no static mapping after derivation' })
        continue
      }
      const desiredCategory = target.category
      if (row.category === desiredCategory) continue
      // Update
      await pool.query('UPDATE portfolio_items SET category = $1, updated_at = now() WHERE id = $2', [desiredCategory, row.id])
      updated++
      console.log('Updated', row.public_id, '->', desiredCategory)
    }

    console.log('Summary: matched rows=', res.rowCount, 'updated=', updated, 'unable=', unable.length)
    if (unable.length > 0) console.log('Unable samples:', unable.slice(0,5))
  } catch (e) {
    console.error('ERROR', e && e.message ? e.message : e)
  } finally {
    await pool.end()
  }
}

main()
