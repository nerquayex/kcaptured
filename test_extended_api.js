#!/usr/bin/env node

// Extended API test suite for more complex mutations
require('dotenv').config({ path: '.env.local' })

const http = require('http')
const jwt = require('jsonwebtoken')

const jwtSecret = process.env.JWT_SECRET
const baseUrl = 'http://localhost:3001'

if (!jwtSecret) {
  console.error('ERROR: JWT_SECRET not configured')
  process.exit(1)
}

function generateToken() {
  return jwt.sign({ upload: true }, jwtSecret, { expiresIn: '10m' })
}

const token = generateToken()

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
          resolve({ status: res.statusCode, body: parsed })
        } catch {
          resolve({ status: res.statusCode, body: data })
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
  console.log('Extended API Test Suite - Complex Mutations')
  console.log('='.repeat(70))
  console.log('')

  let testsPassed = 0
  let testsFailed = 0

  // Test 1: Settings GET
  console.log('Test 1: GET /api/settings')
  try {
    const res = await request('GET', '/api/settings')
    if (res.status === 200) {
      console.log(`  ✓ PASS: Business Name: ${res.body.business_name}`)
      testsPassed++
    } else {
      console.log(`  ✗ FAIL: Status ${res.status}`)
      testsFailed++
    }
  } catch (err) {
    console.log(`  ✗ ERROR: ${err.message}`)
    testsFailed++
  }
  console.log('')

  // Test 2: Settings PATCH (update)
  console.log('Test 2: PATCH /api/settings (update)')
  try {
    const updateData = {
      email: 'newemail@test.com',
      instagramUrl: 'https://www.instagram.com/test',
    }
    const res = await request('PATCH', '/api/settings', updateData)
    if (res.status === 200 && res.body.success) {
      console.log(`  ✓ PASS: Settings updated`)
      testsPassed++
      
      // Verify update persisted
      const verifyRes = await request('GET', '/api/settings')
      if (verifyRes.body.email === 'newemail@test.com') {
        console.log(`  ✓ PASS: Update persisted in database`)
      } else {
        console.log(`  ✗ WARNING: Update may not have persisted`)
      }
    } else {
      console.log(`  ✗ FAIL: Status ${res.status}, response: ${JSON.stringify(res.body)}`)
      testsFailed++
    }
  } catch (err) {
    console.log(`  ✗ ERROR: ${err.message}`)
    testsFailed++
  }
  console.log('')

  // Test 3: Get portfolio item for testing
  console.log('Test 3: GET portfolio items for edit test')
  let portfolioIdForEdit = null
  try {
    const res = await request('GET', '/api/portfolio-images')
    if (res.status === 200 && res.body.length > 0) {
      portfolioIdForEdit = res.body[0].id
      console.log(`  ✓ PASS: Retrieved portfolio items`)
      console.log(`  Selected item for edit test: ${portfolioIdForEdit.substring(0, 20)}...`)
      testsPassed++
    } else {
      console.log(`  ✗ FAIL: Could not retrieve portfolio items`)
      testsFailed++
    }
  } catch (err) {
    console.log(`  ✗ ERROR: ${err.message}`)
    testsFailed++
  }
  console.log('')

  // Test 4: Portfolio item PATCH (edit)
  if (portfolioIdForEdit) {
    console.log('Test 4: PATCH /api/portfolio-item (edit metadata)')
    try {
      const updateData = {
        id: portfolioIdForEdit,
        title: 'Test Updated Title',
        caption: 'Test caption updated via API',
      }
      const res = await request('PATCH', '/api/portfolio-item', updateData)
      if (res.status === 200 && res.body.success) {
        console.log(`  ✓ PASS: Portfolio item updated`)
        testsPassed++
      } else {
        console.log(`  ✗ FAIL: Status ${res.status}, response: ${JSON.stringify(res.body)}`)
        testsFailed++
      }
    } catch (err) {
      console.log(`  ✗ ERROR: ${err.message}`)
      testsFailed++
    }
  }
  console.log('')

  // Test 5: Testimonial reorder
  console.log('Test 5: POST /api/testimonial-reorder')
  try {
    const getRes = await request('GET', '/api/testimonials')
    if (getRes.status === 200 && getRes.body.length >= 2) {
      const ids = getRes.body.map(t => t.id).reverse()
      const res = await request('POST', '/api/testimonial-reorder', { ids })
      if (res.status === 200 && res.body.success) {
        console.log(`  ✓ PASS: Testimonials reordered`)
        testsPassed++
      } else {
        console.log(`  ✗ FAIL: Status ${res.status}`)
        testsFailed++
      }
    }
  } catch (err) {
    console.log(`  ✗ ERROR: ${err.message}`)
    testsFailed++
  }
  console.log('')

  // Test 6: Create a test package (if we can)
  console.log('Test 6: POST /api/package (create test package)')
  const testPackageId = `test-package-${Date.now()}`
  try {
    const createData = {
      id: testPackageId,
      category: 'test',
      name: 'Test Package',
      price: 9999,
    }
    const res = await request('POST', '/api/package', createData)
    if (res.status === 200 && res.body.success) {
      console.log(`  ✓ PASS: Test package created`)
      testsPassed++
    } else {
      console.log(`  ✗ FAIL: Status ${res.status}`)
      testsFailed++
    }
  } catch (err) {
    console.log(`  ✗ ERROR: ${err.message}`)
    testsFailed++
  }
  console.log('')

  // Summary
  console.log('='.repeat(70))
  console.log(`Tests Passed: ${testsPassed}`)
  console.log(`Tests Failed: ${testsFailed}`)
  console.log('')

  process.exit(testsFailed === 0 ? 0 : 1)
}

setTimeout(runTests, 1000)
