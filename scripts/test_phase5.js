const fs = require('fs')
const path = require('path')
const jwt = require('jsonwebtoken')

for (const line of fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8').split(/\r?\n/)) {
  const separator = line.indexOf('=')
  if (separator > 0) process.env[line.slice(0, separator)] = line.slice(separator + 1).replace(/^['"]|['"]$/g, '')
}

const base = process.env.BASE_URL || 'http://127.0.0.1:3000'
const token = jwt.sign({ upload: true }, process.env.JWT_SECRET, { expiresIn: '10m' })
const adminHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, 'x-upload-source': 'kc-upload' }

async function request(pathname, options) {
  const response = await fetch(`${base}${pathname}`, options)
  const body = await response.json()
  if (!response.ok) throw new Error(`${pathname} ${response.status}: ${body.error ?? 'request failed'}`)
  return body
}

;(async () => {
  const original = await request('/api/settings', { headers: adminHeaders })
  const updated = { ...original, studioName: 'KCAPTURED Studios Validation', maxConcurrentBookings: original.maxConcurrentBookings }
  await request('/api/settings', { method: 'PATCH', headers: adminHeaders, body: JSON.stringify(updated) })
  const persisted = await request('/api/settings', { headers: adminHeaders })
  if (persisted.studioName !== updated.studioName) throw new Error('Settings did not persist')
  await request('/api/settings', { method: 'PATCH', headers: adminHeaders, body: JSON.stringify(original) })
  const audit = await request('/api/audit', { headers: adminHeaders })
  if (!audit.some((entry) => entry.description === 'Updated site settings')) throw new Error('Settings audit record missing')
  console.log('PHASE5_SETTINGS_AUDIT_OK')
})().catch((error) => {
  console.error('PHASE5_SETTINGS_AUDIT_FAILED', error.message)
  process.exit(1)
})
