#!/usr/bin/env node

// Comprehensive HTTP API test suite for KCaptured CMS
// Tests against a running dev server on port 3001

require('dotenv').config({ path: '.env.local' })

const http = require('http')
const jwt = require('jsonwebtoken')

const jwtSecret = process.env.JWT_SECRET
const uploadKey = process.env.UPLOAD_KEY
const baseUrl = 'http://localhost:3001'

if (!jwtSecret) {
  console.error('ERROR: JWT_SECRET not configured')
  process.exit(1)
}

// Generate a valid JWT token
function generateToken() {
  return jwt.sign({ upload: true }, jwtSecret, { expiresIn: '10m' })
}

const token = generateToken()

// Helper to make HTTP requests
function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(baseUrl + path)
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'x-upload-source': 'kc-upload',
      },
    }

    const req = http.request(options, (res) => {
      let data = ''
      res.on('data', chunk => { data += chunk })
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data)
          resolve({ status: res.statusCode, body: parsed, headers: res.headers })
        } catch {
          resolve({ status: res.statusCode, body: data, headers: res.headers })
        }
      })
    })

    req.on('error', reject)

    if (body) {
      req.write(JSON.stringify(body))
    }
    req.end()
  })
}

async function runTests() {
  console.log('KCaptured CMS - Live API Test Suite')
  console.log('='.repeat(70))
  console.log('')

  const results = {
    passed: 0,
    failed: 0,
    errors: [],
  }

  // Test 1: Portfolio images GET
  console.log('Test 1: GET /api/portfolio-images')
  try {
    const res = await request('GET', '/api/portfolio-images')
    if (res.status === 200 && Array.isArray(res.body)) {
      console.log(`  ✓ PASS: Retrieved ${res.body.length} portfolio items`)
      results.passed++
    } else {
      console.log(`  ✗ FAIL: Status ${res.status}, expected Array`)
      results.failed++
      results.errors.push(`Portfolio GET returned status ${res.status}`)
    }
  } catch (err) {
    console.log(`  ✗ ERROR: ${err.message}`)
    results.failed++
    results.errors.push(`Portfolio GET: ${err.message}`)
  }
  console.log('')

  // Test 2: GET /api/packages
  console.log('Test 2: GET /api/packages')
  try {
    const res = await request('GET', '/api/packages')
    if (res.status === 200 && Array.isArray(res.body)) {
      console.log(`  ✓ PASS: Retrieved ${res.body.length} packages`)
      results.passed++
    } else {
      console.log(`  ✗ FAIL: Status ${res.status}`)
      results.failed++
    }
  } catch (err) {
    console.log(`  ✗ ERROR: ${err.message}`)
    results.failed++
  }
  console.log('')

  // Test 3: GET /api/testimonials
  console.log('Test 3: GET /api/testimonials')
  try {
    const res = await request('GET', '/api/testimonials')
    if (res.status === 200 && Array.isArray(res.body)) {
      console.log(`  ✓ PASS: Retrieved ${res.body.length} testimonials`)
      results.passed++
    } else {
      console.log(`  ✗ FAIL: Status ${res.status}`)
      results.failed++
    }
  } catch (err) {
    console.log(`  ✗ ERROR: ${err.message}`)
    results.failed++
  }
  console.log('')

  // Test 4: POST /api/bookings (create booking)
  console.log('Test 4: POST /api/bookings (create test booking)')
  try {
    const bookingData = {
      clientName: 'Test Client',
      email: 'test@example.com',
      phone: '555-0123',
      sessionType: 'lifestyle',
      requestedAt: new Date().toISOString(),
      message: 'Test booking from API test suite',
    }
    const res = await request('POST', '/api/bookings', bookingData)
    if (res.status === 201 && res.body.success) {
      console.log(`  ✓ PASS: Booking created with ID ${res.body.id}`)
      results.passed++
    } else {
      console.log(`  ✗ FAIL: Status ${res.status}, response: ${JSON.stringify(res.body)}`)
      results.failed++
      results.errors.push(`Bookings POST failed: ${res.status}`)
    }
  } catch (err) {
    console.log(`  ✗ ERROR: ${err.message}`)
    results.failed++
    results.errors.push(`Bookings POST: ${err.message}`)
  }
  console.log('')

  // Test 5: Portfolio reorder
  console.log('Test 5: POST /api/portfolio-reorder (reorder test)')
  try {
    const getRes = await request('GET', '/api/portfolio-images')
    if (getRes.status === 200 && getRes.body.length >= 2) {
      const ids = getRes.body.slice(0, 2).map(item => item.id)
      const reorderRes = await request('POST', '/api/portfolio-reorder', { ids })
      if (reorderRes.status === 200 && reorderRes.body.success) {
        console.log(`  ✓ PASS: Portfolio reordered successfully`)
        results.passed++
      } else {
        console.log(`  ✗ FAIL: Status ${reorderRes.status}, response: ${JSON.stringify(reorderRes.body)}`)
        results.failed++
        results.errors.push(`Portfolio reorder failed: ${reorderRes.status}`)
      }
    } else {
      console.log(`  ✗ SKIP: Not enough portfolio items`)
      results.failed++
    }
  } catch (err) {
    console.log(`  ✗ ERROR: ${err.message}`)
    results.failed++
    results.errors.push(`Portfolio reorder: ${err.message}`)
  }
  console.log('')

  // Test 6: Package reorder
  console.log('Test 6: POST /api/package-reorder (reorder test)')
  try {
    const getRes = await request('GET', '/api/packages')
    if (getRes.status === 200 && getRes.body.length >= 2) {
      const ids = getRes.body.slice(0, 2).map(item => item.id)
      const reorderRes = await request('POST', '/api/package-reorder', { ids })
      if (reorderRes.status === 200 && reorderRes.body.success) {
        console.log(`  ✓ PASS: Packages reordered successfully`)
        results.passed++
      } else {
        console.log(`  ✗ FAIL: Status ${reorderRes.status}, response: ${JSON.stringify(reorderRes.body)}`)
        results.failed++
        results.errors.push(`Package reorder failed: ${reorderRes.status}`)
      }
    } else {
      console.log(`  ✗ SKIP: Not enough packages`)
      results.failed++
    }
  } catch (err) {
    console.log(`  ✗ ERROR: ${err.message}`)
    results.failed++
    results.errors.push(`Package reorder: ${err.message}`)
  }
  console.log('')

  // Summary
  console.log('='.repeat(70))
  console.log('TEST RESULTS')
  console.log('─'.repeat(70))
  console.log(`Passed: ${results.passed}`)
  console.log(`Failed: ${results.failed}`)
  console.log('')

  if (results.errors.length > 0) {
    console.log('ERRORS ENCOUNTERED:')
    results.errors.forEach(err => {
      console.log(`  • ${err}`)
    })
  }

  console.log('')
  process.exit(results.failed === 0 ? 0 : 1)
}

// Wait a second for server to be fully ready
setTimeout(runTests, 1000)
