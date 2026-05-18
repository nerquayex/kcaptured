import { appendUploadLog, getClientIp } from '@/lib/logger'
import { generateUploadToken } from '@/lib/auth-utils'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const ip = getClientIp(request)
  const userAgent = request.headers.get('user-agent') ?? 'unknown'

  let body: { key?: string } = {}
  try {
    body = (await request.json()) as { key?: string }
  } catch {
    await appendUploadLog({
      type: 'key_failed',
      error: 'Invalid request body',
      ip,
      userAgent,
    })
    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const providedKey = String(body.key ?? '')
  const secretKey = process.env.UPLOAD_KEY

  if (!secretKey) {
    await appendUploadLog({
      type: 'key_failed',
      error: 'UPLOAD_KEY not configured',
      ip,
      userAgent,
    })
    return new Response(JSON.stringify({ error: 'Server not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (providedKey === secretKey) {
    const token = generateUploadToken()
    await appendUploadLog({
      type: 'key_success',
      ip,
      userAgent,
    })

    return new Response(JSON.stringify({ success: true, token }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  await appendUploadLog({
    type: 'key_failed',
    error: 'Invalid upload key',
    ip,
    userAgent,
  })

  return new Response(JSON.stringify({ error: 'Invalid key' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  })
}
