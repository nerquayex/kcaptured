import { randomUUID } from 'crypto'
import { pool } from '@/lib/db'
import { verifyUploadToken } from '@/lib/auth-utils'

export const runtime = 'nodejs'

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })
}

function isAdmin(request: Request) {
  const token = (request.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '')
  return Boolean(token && request.headers.get('x-upload-source') === 'kc-upload' && verifyUploadToken(token))
}

function mapRow(row: any) {
  return {
    id: row.id,
    client: row.client_name,
    email: row.email,
    phone: row.phone,
    package: row.package_name,
    preferredDate: row.preferred_date,
    requestDate: row.request_date,
    status: row.status,
    notes: row.notes,
  }
}

function validStatus(status: unknown) {
  return status === 'pending' || status === 'to_confirm' || status === 'confirmed'
}

export async function GET(request: Request) {
  if (!isAdmin(request)) return json({ error: 'Unauthorized' }, 401)
  try {
    const result = await pool.query('SELECT * FROM bookings ORDER BY request_date DESC')
    return json(result.rows.map(mapRow))
  } catch (error) {
    console.error('[bookings][GET] error', error)
    return json({ error: 'Failed to load bookings' }, 500)
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const clientName = String(body.clientName ?? '').trim()
    const email = String(body.email ?? '').trim()
    const phone = String(body.phone ?? '').trim()
    if (!clientName || (!email && !phone)) return json({ error: 'Name and at least one contact method are required' }, 400)
    if (clientName.length > 120 || email.length > 254 || phone.length > 40 || String(body.notes ?? '').length > 2000) return json({ error: 'Booking details are too long' }, 400)
    if (email && !/^\S+@\S+\.\S+$/.test(email)) return json({ error: 'Enter a valid email address' }, 400)
    const status = 'pending'
    const result = await pool.query(
      `INSERT INTO bookings (id, client_name, email, phone, package_name, preferred_date, request_date, status, notes, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,now(),$7,$8,now(),now()) RETURNING *`,
      [randomUUID(), clientName, email, phone, body.packageName ? String(body.packageName).trim() : '', body.preferredDate ? new Date(body.preferredDate) : null, status, body.notes ? String(body.notes).trim() : null],
    )
    return json({ booking: mapRow(result.rows[0]) }, 201)
  } catch (error) {
    console.error('[bookings][POST] error', error)
    return json({ error: 'Failed to create booking' }, 500)
  }
}

export async function PATCH(request: Request) {
  if (!isAdmin(request)) return json({ error: 'Unauthorized' }, 401)
  try {
    const body = await request.json()
    if (!body.id || !validStatus(body.status)) return json({ error: 'A valid booking id and status are required' }, 400)
    const result = await pool.query('UPDATE bookings SET status = $1, updated_at = now() WHERE id = $2 RETURNING *', [body.status, body.id])
    if (!result.rows[0]) return json({ error: 'Booking not found' }, 404)
    return json({ booking: mapRow(result.rows[0]) })
  } catch (error) {
    console.error('[bookings][PATCH] error', error)
    return json({ error: 'Failed to update booking' }, 500)
  }
}

export async function DELETE(request: Request) {
  if (!isAdmin(request)) return json({ error: 'Unauthorized' }, 401)
  try {
    const body = await request.json()
    if (!body.id) return json({ error: 'Missing booking id' }, 400)
    const result = await pool.query('DELETE FROM bookings WHERE id = $1 RETURNING id', [body.id])
    if (!result.rows[0]) return json({ error: 'Booking not found' }, 404)
    return json({ success: true })
  } catch (error) {
    console.error('[bookings][DELETE] error', error)
    return json({ error: 'Failed to delete booking' }, 500)
  }
}