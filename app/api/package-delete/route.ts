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
    await appendUploadLog({ type: 'upload_error', error: 'Unauthorized package delete', uploadSource: uploadSource ?? 'missing', ip, userAgent })
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
  }

  try {
    const body = await request.json()
    const { id } = body as any
    if (!id) return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400, headers: { 'Content-Type': 'application/json' } })

    await pool.query('DELETE FROM packages WHERE id = $1', [id])

    await appendUploadLog({ type: 'upload_success', ip, userAgent })

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (err) {
    console.error('[package-delete] error', err)
    return new Response(JSON.stringify({ error: 'Delete failed' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}
