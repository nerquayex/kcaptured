#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' })

const { Pool } = require('@neondatabase/serverless')

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.error('ERROR: DATABASE_URL not found')
  process.exit(1)
}

const pool = new Pool({ connectionString })

async function test() {
  try {
    const result = await pool.query('SELECT COUNT(*) FROM portfolio_items')
    console.log('Total Portfolio Items:', result.rows[0].count)

    const allItems = await pool.query('SELECT id, sort_order FROM portfolio_items ORDER BY sort_order')
    console.log('Total rows returned:', allItems.rows.length)

    if (allItems.rows.length > 0) {
      console.log('')
      console.log('First 10 items:')
      allItems.rows.slice(0, 10).forEach((item, i) => {
        console.log(`  ${i + 1}. ID: ${item.id}, Sort Order: ${item.sort_order}`)
      })
    }

    process.exit(0)
  } catch (err) {
    console.error('ERROR:', err.message)
    process.exit(1)
  }
}

test()
