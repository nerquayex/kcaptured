const fs = require('fs')
const path = require('path')
const jwt = require('jsonwebtoken')

for (const line of fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8').split(/\r?\n/)) {
  const separator = line.indexOf('=')
  if (separator > 0) process.env[line.slice(0, separator)] = line.slice(separator + 1).replace(/^['"]|['"]$/g, '')
}

const base = process.env.BASE_URL || 'http://localhost:3000'
const token = jwt.sign({ upload: true }, process.env.JWT_SECRET, { expiresIn: '10m' })
const adminHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, 'x-upload-source': 'kc-upload' }

async function request(pathname, options) {
  const response = await fetch(`${base}${pathname}`, options)
  const body = await response.json()
  if (!response.ok) throw new Error(`${pathname} ${response.status}: ${body.error ?? 'request failed'}`)
  return body
}

;(async () => {
  const testimonial = await request('/api/testimonials', { method: 'POST', headers: adminHeaders, body: JSON.stringify({ clientName: 'Phase 4 CRUD Test', content: 'temporary', date: '2026-08-22', published: false }) })
  const testimonialId = testimonial.testimonial.id
  await request('/api/testimonials', { method: 'PATCH', headers: adminHeaders, body: JSON.stringify({ id: testimonialId, content: 'temporary edited' }) })
  await request('/api/testimonials', { method: 'DELETE', headers: adminHeaders, body: JSON.stringify({ id: testimonialId }) })

  const booking = await request('/api/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ clientName: 'Phase 4 CRUD Booking', email: 'phase4-crud@example.com' }) })
  const bookingId = booking.booking.id
  if (booking.booking.status !== 'pending') throw new Error('New booking was not pending')
  await request('/api/bookings', { method: 'PATCH', headers: adminHeaders, body: JSON.stringify({ id: bookingId, status: 'confirmed' }) })
  await request('/api/bookings', { method: 'DELETE', headers: adminHeaders, body: JSON.stringify({ id: bookingId }) })

  const packageId = `phase4-${Date.now()}`
  await request('/api/package', { method: 'POST', headers: adminHeaders, body: JSON.stringify({ id: packageId, category: 'test', name: 'Phase 4 CRUD Test', price: 1, features: [] }) })
  await request('/api/package-delete', { method: 'POST', headers: adminHeaders, body: JSON.stringify({ id: packageId }) })

  console.log('PHASE4_CRUD_OK')
})().catch((error) => {
  console.error('PHASE4_CRUD_FAILED', error.message)
  process.exit(1)
})
