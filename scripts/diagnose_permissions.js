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
  console.error(JSON.stringify({ error: 'DATABASE_URL_MISSING' }))
  process.exit(2)
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

;(async () => {
  try {
    const who = await pool.query("SELECT current_user as current_user, current_database() as current_database")
    const currentUser = who.rows[0].current_user
    const currentDb = who.rows[0].current_database

    const hasCreateRes = await pool.query("SELECT has_schema_privilege(current_user, 'public', 'CREATE') as has_create")
    const hasCreate = hasCreateRes.rows[0].has_create === true

    const ownerRes = await pool.query("SELECT nspname, pg_get_userbyid(nspowner) as owner, nspacl FROM pg_namespace WHERE nspname = 'public'")
    const ownerRow = ownerRes.rows[0] || null

    const roleMembers = await pool.query("SELECT rolname, rolsuper, rolinherit, rolcreaterole, rolcreatedb, rolcanlogin FROM pg_roles WHERE rolname = current_user")
    const roleInfo = roleMembers.rows[0] || null

    // Also list privileges on the public schema
    const privs = await pool.query("SELECT grantor, grantee, privilege_type FROM information_schema.role_table_grants WHERE table_schema = 'public' LIMIT 5")

    console.log(JSON.stringify({
      current_user: currentUser,
      current_database: currentDb,
      has_create_on_public: hasCreate,
      public_schema: ownerRow,
      current_role_info: roleInfo,
      sample_privileges: privs.rows.slice(0, 10),
    }, null, 2))

    await pool.end()
    process.exit(0)
  } catch (err) {
    console.error(JSON.stringify({ error: String(err.message || err) }))
    try { await pool.end() } catch (_) {}
    process.exit(3)
  }
})()
