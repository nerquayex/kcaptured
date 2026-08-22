const fs = require('fs')
const path = require('path')
const { Pool } = require('@neondatabase/serverless')

function loadEnv() {
  const file = path.join(__dirname, '..', '.env.local')
  if (!fs.existsSync(file)) return
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const separator = trimmed.indexOf('=')
    if (separator === -1) continue
    let value = trimmed.slice(separator + 1)
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1)
    process.env[trimmed.slice(0, separator)] = value
  }
}

loadEnv()
const migrations = ['0001_add_testimonials.sql', '0002_allow_testimonial_content_null.sql', '0003_phase4_optional_fields.sql', '0004_phase5_audit_logs.sql']
  .map((file) => fs.readFileSync(path.join(__dirname, '..', 'drizzle', file), 'utf8'))
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

;(async () => {
  try {
    for (const sql of migrations) {
      try {
        await pool.query(sql)
      } catch (error) {
        if (!String(error.message).includes('already exists')) throw error
      }
    }
    console.log('PHASE4_MIGRATION_OK')
  } finally {
    await pool.end()
  }
})().catch((error) => {
  console.error('PHASE4_MIGRATION_ERROR', error.message)
  process.exit(1)
})
