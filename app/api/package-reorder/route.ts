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
    await appendUploadLog({ type: 'upload_error', error: 'Unauthorized package reorder', uploadSource: uploadSource ?? 'missing', ip, userAgent })
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
  }

  try {
    const body = await request.json()
    const { ids } = body as { ids?: string[] }
    if (!Array.isArray(ids) || ids.length === 0) {
      return new Response(JSON.stringify({ error: 'Missing ids array' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }

    const cases: string[] = []
    const params: any[] = []
    ids.forEach((id, i) => {
      cases.push(`WHEN $${i + 1} THEN ${i + 1}`)
      params.push(id)
    })

    const sql = `UPDATE packages SET sort_order = CASE id ${cases.join(' ')} END, updated_at = now() WHERE id = ANY($${params.length + 1}::text[])`
    params.push(ids)

    await pool.query('BEGIN')
    await pool.query(sql, params)
    await pool.query('COMMIT')

    await appendUploadLog({ type: 'upload_success', ip, userAgent })

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (err) {
    try { await pool.query('ROLLBACK') } catch (_) {}
    console.error('[package-reorder] error', err)
    return new Response(JSON.stringify({ error: 'Reorder failed' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}
