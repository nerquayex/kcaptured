#!/usr/bin/env node

// Apply the bookings migration safely
require('dotenv').config({ path: '.env.local' })

const { Pool } = require('@neondatabase/serverless')
const fs = require('fs')
const path = require('path')

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.error('ERROR: DATABASE_URL not found in environment variables')
  process.exit(1)
}

console.log('Applying bookings migration...')
console.log('')

const pool = new Pool({ connectionString })

async function applyMigration() {
  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, 'drizzle/migrations/0003_create_bookings.sql')
    const sql = fs.readFileSync(migrationPath, 'utf-8')

    console.log('Migration SQL:')
    console.log(sql)
    console.log('')
    console.log('Executing migration...')

    // Execute the migration
    await pool.query(sql)

    console.log('✓ Migration applied successfully')

    // Verify table exists and has correct schema
    const tableCheck = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'bookings'
      ORDER BY ordinal_position
    `)

    console.log('')
    console.log('Bookings table columns:')
    tableCheck.rows.forEach(row => {
      const nullable = row.is_nullable === 'YES' ? 'nullable' : 'NOT NULL'
      console.log(`  ${row.column_name.padEnd(20)} ${row.data_type.padEnd(20)} ${nullable}`)
    })

    // Check for indexes
    const indexCheck = await pool.query(`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'bookings'
    `)

    if (indexCheck.rows.length > 0) {
      console.log('')
      console.log('Indexes on bookings table:')
      indexCheck.rows.forEach(row => {
        console.log(`  ${row.indexname}`)
      })
    }

    console.log('')
    console.log('✓ Bookings table ready')
    process.exit(0)
  } catch (err) {
    console.error('✗ ERROR:', err.message)
    process.exit(1)
  }
}

applyMigration()
