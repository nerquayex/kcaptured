import { verifyUploadToken } from '@/lib/auth-utils'
import { appendUploadLog, getClientIp } from '@/lib/logger'
import { pool } from '@/lib/db'

export const runtime = 'nodejs'

export async function PATCH(request: Request) {
  const ip = getClientIp(request)
  const userAgent = request.headers.get('user-agent') ?? 'unknown'
  const authHeader = request.headers.get('authorization') ?? ''
  const token = authHeader.replace(/^Bearer\s+/i, '')
  const uploadSource = request.headers.get('x-upload-source')

  if (!token || uploadSource !== 'kc-upload' || !verifyUploadToken(token)) {
    await appendUploadLog({ type: 'upload_error', error: 'Unauthorized portfolio update', uploadSource: uploadSource ?? 'missing', ip, userAgent })
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
  }

  try {
    const body = await request.json()
    const { id, category, caption, featured, active, title } = body as any

    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }

    const sets: string[] = []
    const values: any[] = []
    let idx = 1
    if (category !== undefined) { sets.push(`category = $${idx++}`); values.push(category) }
    if (caption !== undefined) { sets.push(`caption = $${idx++}`); values.push(caption) }
    if (featured !== undefined) { sets.push(`featured = $${idx++}`); values.push(Boolean(featured)) }
    if (active !== undefined) { sets.push(`active = $${idx++}`); values.push(Boolean(active)) }
    if (title !== undefined) { sets.push(`title = $${idx++}`); values.push(title) }

    if (sets.length === 0) {
      return new Response(JSON.stringify({ error: 'No fields provided' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }

    values.push(id)
    const sql = `UPDATE portfolio_items SET ${sets.join(', ')}, updated_at = now() WHERE id = $${idx} RETURNING *`
    const res = await pool.query(sql, values)
    const row = res?.rows?.[0]

    await appendUploadLog({ type: 'upload_success', ip, userAgent })

    return new Response(JSON.stringify({ success: true, item: row }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (err) {
    console.error('[portfolio-item][PATCH] error', err)
    return new Response(JSON.stringify({ error: 'Update failed' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}
