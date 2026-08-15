const fs = require('fs')
const path = require('path')
const { Pool } = require('@neondatabase/serverless')
const { v2: cloudinary } = require('cloudinary')

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

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function main() {
  const targetPublicId = 'client-uploads/test/kw1mxnd1lt2ewcd9txvp'
  try {
    console.log('Deleting DB row...')
    await pool.query('DELETE FROM portfolio_items WHERE public_id = $1', [targetPublicId])
    console.log('Deleting Cloudinary resource...')
    await cloudinary.api.delete_resources([targetPublicId])
    console.log('Cleanup complete')
  } catch (e) {
    console.error('Cleanup error', e)
  } finally {
    await pool.end()
  }
}

main()
