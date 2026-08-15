import { verifyUploadToken } from '@/lib/auth-utils'
import { appendUploadLog, getClientIp } from '@/lib/logger'
import { pool } from '@/lib/db'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const ip = getClientIp(request)
  const userAgent = request.headers.get('user-agent') ?? 'unknown'
  const authHeader = request.headers.get('authorization') ?? ''
  const token = authHeader.replace(/^Bearer\s+/i, '')
  const uploadSource = request.headers.get('x-upload-source')

  if (!token || uploadSource !== 'kc-upload' || !verifyUploadToken(token)) {
    await appendUploadLog({ type: 'upload_error', error: 'Unauthorized package create', uploadSource: uploadSource ?? 'missing', ip, userAgent })
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
  }

  try {
    const body = await request.json()
    const { id, category, name, duration, price, features, sampleUrl } = body as any
    if (!id || !category || !name) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }

    const sql = `INSERT INTO packages (id, category, name, duration, price, features, sample_url, sort_order, active, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9, now(), now()) RETURNING *`
    // set sort_order to a high number to append
    const params = [id, category, name, duration || null, Number(price) || 0, JSON.stringify(features || []), sampleUrl || null, 9999, true]
    const res = await pool.query(sql, params)
    const row = res?.rows?.[0]

    await appendUploadLog({ type: 'upload_success', ip, userAgent })

    return new Response(JSON.stringify({ success: true, item: row }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (err) {
    console.error('[package][POST] error', err)
    return new Response(JSON.stringify({ error: 'Create failed' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}

export async function PATCH(request: Request) {
  const ip = getClientIp(request)
  const userAgent = request.headers.get('user-agent') ?? 'unknown'
  const authHeader = request.headers.get('authorization') ?? ''
  const token = authHeader.replace(/^Bearer\s+/i, '')
  const uploadSource = request.headers.get('x-upload-source')

  if (!token || uploadSource !== 'kc-upload' || !verifyUploadToken(token)) {
    await appendUploadLog({ type: 'upload_error', error: 'Unauthorized package update', uploadSource: uploadSource ?? 'missing', ip, userAgent })
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
  }

  try {
    const body = await request.json()
    const { id, category, name, duration, price, features, sampleUrl, active } = body as any
    if (!id) return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400, headers: { 'Content-Type': 'application/json' } })

    const sets = []
    const vals = []
    let idx = 1
    if (category !== undefined) { sets.push(`category = $${idx++}`); vals.push(category) }
    if (name !== undefined) { sets.push(`name = $${idx++}`); vals.push(name) }
    if (duration !== undefined) { sets.push(`duration = $${idx++}`); vals.push(duration) }
    if (price !== undefined) { sets.push(`price = $${idx++}`); vals.push(Number(price) || 0) }
    if (features !== undefined) { sets.push(`features = $${idx++}`); vals.push(JSON.stringify(features || [])) }
    if (sampleUrl !== undefined) { sets.push(`sample_url = $${idx++}`); vals.push(sampleUrl) }
    if (active !== undefined) { sets.push(`active = $${idx++}`); vals.push(Boolean(active)) }

    if (sets.length === 0) return new Response(JSON.stringify({ error: 'No fields provided' }), { status: 400, headers: { 'Content-Type': 'application/json' } })

    vals.push(id)
    const sql = `UPDATE packages SET ${sets.join(', ')}, updated_at = now() WHERE id = $${idx} RETURNING *`
    const res = await pool.query(sql, vals)
    const row = res?.rows?.[0]

    await appendUploadLog({ type: 'upload_success', ip, userAgent })

    return new Response(JSON.stringify({ success: true, item: row }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (err) {
    console.error('[package][PATCH] error', err)
    return new Response(JSON.stringify({ error: 'Update failed' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}
