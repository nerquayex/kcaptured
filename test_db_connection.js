#!/usr/bin/env node

// Test database connectivity and inspect current state
require('dotenv').config({ path: '.env.local' })

const { Pool } = require('@neondatabase/serverless')

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.error('ERROR: DATABASE_URL not found in environment variables')
  process.exit(1)
}

console.log('Testing database connection...')
console.log('Database: Neon PostgreSQL')
console.log('')

const pool = new Pool({ connectionString })

async function test() {
  try {
    // Test basic connection
    const connResult = await pool.query('SELECT NOW()')
    console.log('✓ Database connection successful')
    console.log(`  Server time: ${connResult.rows[0].now}`)
    console.log('')

    // Check current user
    const userResult = await pool.query('SELECT current_user, current_schema')
    const currentUser = userResult.rows[0].current_user
    const currentSchema = userResult.rows[0].current_schema
    console.log('✓ Current user and schema:')
    console.log(`  User: ${currentUser}`)
    console.log(`  Schema: ${currentSchema}`)
    console.log('')

    // Check table existence and row counts
    const tables = ['portfolio_items', 'packages', 'testimonials', 'bookings', 'site_settings']
    console.log('Table Status:')
    console.log('─'.repeat(60))

    for (const table of tables) {
      try {
        const existsResult = await pool.query(
          `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = '${table}')`
        )
        const exists = existsResult.rows[0].exists

        if (!exists) {
          console.log(`✗ ${table.padEnd(20)} NOT EXISTS`)
          continue
        }

        const countResult = await pool.query(`SELECT COUNT(*) FROM ${table}`)
        const count = countResult.rows[0].count

        console.log(`✓ ${table.padEnd(20)} ${count} rows`)
      } catch (err) {
        console.log(`✗ ${table.padEnd(20)} ERROR: ${err.message}`)
      }
    }

    console.log('─'.repeat(60))
    console.log('')

    // Check schema permissions
    console.log('Schema Permissions:')
    const permResult = await pool.query(`
      SELECT grantee, privilege_type
      FROM information_schema.role_table_grants
      WHERE grantee = '${currentUser}'
      LIMIT 10
    `)
    if (permResult.rows.length > 0) {
      console.log(`✓ User has permissions on schema`)
      permResult.rows.slice(0, 5).forEach(row => {
        console.log(`  - ${row.privilege_type}`)
      })
      if (permResult.rows.length > 5) {
        console.log(`  ... and ${permResult.rows.length - 5} more`)
      }
    } else {
      console.log('? Could not determine specific permissions')
    }

    console.log('')
    console.log('✓ All checks complete')
    process.exit(0)
  } catch (err) {
    console.error('✗ ERROR:', err.message)
    process.exit(1)
  }
}

test()
