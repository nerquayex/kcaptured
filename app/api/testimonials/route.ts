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
  return { id: row.id, clientName: row.client_name, clientRole: row.client_role, content: row.content, videoUrl: row.video_url, videoPublicId: row.video_public_id, imageUrl: row.image_url, rating: row.rating, published: row.published, date: row.testimonial_date ?? String(row.created_at).slice(0, 10), createdAt: row.created_at }
}

function validate(body: any, partial = false) {
  if (!partial && (!String(body.clientName ?? '').trim() || !String(body.content ?? '').trim())) return 'Client name and testimonial content are required'
  if (body.rating !== undefined && (!Number.isInteger(Number(body.rating)) || Number(body.rating) < 1 || Number(body.rating) > 5)) return 'Rating must be between 1 and 5'
  return null
}

export async function GET(request: Request) {
  try {
    const includeDrafts = new URL(request.url).searchParams.get('includeDrafts') === 'true' && isAdmin(request)
    const result = await pool.query(`SELECT * FROM testimonials${includeDrafts ? '' : ' WHERE published = true'} ORDER BY created_at DESC`)
    return json(result.rows.map(mapRow))
  } catch (error) {
    console.error('[testimonials][GET] error', error)
    return json({ error: 'Failed to load testimonials' }, 500)
  }
}

export async function POST(request: Request) {
  if (!isAdmin(request)) return json({ error: 'Unauthorized' }, 401)
  try {
    const body = await request.json()
    const validationError = validate(body)
    if (validationError) return json({ error: validationError }, 400)
    const result = await pool.query(
      `INSERT INTO testimonials (id, client_name, client_role, content, testimonial_date, video_url, video_public_id, image_url, rating, published, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,now(),now()) RETURNING *`,
      [randomUUID(), String(body.clientName).trim(), body.clientRole ? String(body.clientRole).trim() : null, String(body.content).trim(), body.date || null, body.videoUrl || null, body.videoPublicId || null, body.imageUrl || null, Number(body.rating ?? 5), Boolean(body.published)],
    )
    return json({ testimonial: mapRow(result.rows[0]) }, 201)
  } catch (error) {
    console.error('[testimonials][POST] error', error)
    return json({ error: 'Failed to create testimonial' }, 500)
  }
}

export async function PATCH(request: Request) {
  if (!isAdmin(request)) return json({ error: 'Unauthorized' }, 401)
  try {
    const body = await request.json()
    if (!body.id) return json({ error: 'Missing id' }, 400)
    const validationError = validate(body, true)
    if (validationError) return json({ error: validationError }, 400)
    const fields: string[] = []
    const values: unknown[] = []
    const add = (column: string, value: unknown) => { fields.push(`${column} = $${fields.length + 1}`); values.push(value) }
    if (body.clientName !== undefined) add('client_name', String(body.clientName).trim())
    if (body.clientRole !== undefined) add('client_role', body.clientRole ? String(body.clientRole).trim() : null)
    if (body.content !== undefined) add('content', String(body.content).trim())
    if (body.date !== undefined) add('testimonial_date', body.date || null)
    if (body.videoUrl !== undefined) add('video_url', body.videoUrl || null)
    if (body.videoPublicId !== undefined) add('video_public_id', body.videoPublicId || null)
    if (body.imageUrl !== undefined) add('image_url', body.imageUrl || null)
    if (body.rating !== undefined) add('rating', Number(body.rating))
    if (body.published !== undefined) add('published', Boolean(body.published))
    if (!fields.length) return json({ error: 'No fields provided' }, 400)
    values.push(body.id)
    const result = await pool.query(`UPDATE testimonials SET ${fields.join(', ')}, updated_at = now() WHERE id = $${values.length} RETURNING *`, values)
    if (!result.rows[0]) return json({ error: 'Testimonial not found' }, 404)
    return json({ testimonial: mapRow(result.rows[0]) })
  } catch (error) {
    console.error('[testimonials][PATCH] error', error)
    return json({ error: 'Failed to update testimonial' }, 500)
  }
}

export async function DELETE(request: Request) {
  if (!isAdmin(request)) return json({ error: 'Unauthorized' }, 401)
  try {
    const body = await request.json()
    if (!body.id) return json({ error: 'Missing id' }, 400)
    const result = await pool.query('DELETE FROM testimonials WHERE id = $1 RETURNING id', [body.id])
    if (!result.rows[0]) return json({ error: 'Testimonial not found' }, 404)
    return json({ success: true })
  } catch (error) {
    console.error('[testimonials][DELETE] error', error)
    return json({ error: 'Failed to delete testimonial' }, 500)
  }
}
