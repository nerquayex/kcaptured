#!/usr/bin/env node

// Verify database changes from the API test mutations
require('dotenv').config({ path: '.env.local' })

const { Pool } = require('@neondatabase/serverless')

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.error('ERROR: DATABASE_URL not found')
  process.exit(1)
}

const pool = new Pool({ connectionString })

async function verify() {
  console.log('Verifying Database Changes After API Mutations')
  console.log('='.repeat(70))
  console.log('')

  try {
    // Check portfolio order (should have been updated)
    console.log('1. Portfolio sort orders (should reflect recent reorder):')
    const portfolioRes = await pool.query('SELECT id, sort_order FROM portfolio_items ORDER BY sort_order LIMIT 5')
    portfolioRes.rows.forEach((row, i) => {
      console.log(`   ${i + 1}. ID: ${row.id.substring(0, 8)}..., Sort: ${row.sort_order}`)
    })
    console.log('')

    // Check packages order
    console.log('2. Package ordering:')
    const packagesRes = await pool.query('SELECT name, sort_order FROM packages ORDER BY sort_order')
    packagesRes.rows.forEach((row, i) => {
      console.log(`   ${i + 1}. ${row.name.padEnd(30)} Sort: ${row.sort_order}`)
    })
    console.log('')

    // Check bookings
    console.log('3. Bookings table status:')
    const bookingsRes = await pool.query(`
      SELECT COUNT(*) as total, 
             SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
             SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed
      FROM bookings
    `)
    const bookingStats = bookingsRes.rows[0]
    console.log(`   Total bookings: ${bookingStats.total}`)
    console.log(`   - Pending: ${bookingStats.pending}`)
    console.log(`   - Confirmed: ${bookingStats.confirmed}`)
    console.log('')

    // Check latest booking
    if (bookingStats.total > 0) {
      const latestBookingRes = await pool.query(`
        SELECT id, client_name, email, created_at, status
        FROM bookings
        ORDER BY created_at DESC
        LIMIT 1
      `)
      const booking = latestBookingRes.rows[0]
      console.log('   Latest booking:')
      console.log(`     ID: ${booking.id}`)
      console.log(`     Client: ${booking.client_name}`)
      console.log(`     Email: ${booking.email}`)
      console.log(`     Status: ${booking.status}`)
      console.log(`     Created: ${booking.created_at}`)
    }
    console.log('')

    // Check testimonials
    console.log('4. Testimonials:')
    const testimonialRes = await pool.query(`
      SELECT client_name, featured, active, sort_order
      FROM testimonials
      ORDER BY sort_order
    `)
    testimonialRes.rows.forEach((row, i) => {
      const featured = row.featured ? '[⭐ FEATURED]' : ''
      const active = !row.active ? '[HIDDEN]' : ''
      console.log(`   ${i + 1}. ${row.client_name.padEnd(20)} ${featured} ${active}`)
    })
    console.log('')

    // Check portfolio active/featured counts
    console.log('5. Portfolio statistics:')
    const portfolioStatsRes = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN active = true THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN featured = true THEN 1 ELSE 0 END) as featured
      FROM portfolio_items
    `)
    const portfolioStats = portfolioStatsRes.rows[0]
    console.log(`   Total: ${portfolioStats.total}`)
    console.log(`   Active: ${portfolioStats.active}`)
    console.log(`   Featured: ${portfolioStats.featured}`)
    console.log('')

    console.log('='.repeat(70))
    console.log('✓ Database verification complete')
    console.log('')
    process.exit(0)
  } catch (err) {
    console.error('✗ ERROR:', err.message)
    process.exit(1)
  }
}

verify()
