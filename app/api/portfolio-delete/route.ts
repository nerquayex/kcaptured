import { v2 as cloudinary } from 'cloudinary'
import { appendUploadLog, getClientIp } from '@/lib/logger'
import { verifyUploadToken } from '@/lib/auth-utils'

export const runtime = 'nodejs'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: Request) {
  const ip = getClientIp(request)
  const userAgent = request.headers.get('user-agent') ?? 'unknown'
  const authHeader = request.headers.get('authorization') ?? ''
  const token = authHeader.replace(/^Bearer\s+/i, '')
  const uploadSource = request.headers.get('x-upload-source')

  if (!token || uploadSource !== 'kc-upload' || !verifyUploadToken(token)) {
    await appendUploadLog({
      type: 'upload_error',
      error: 'Unauthorized portfolio delete request',
      uploadSource: uploadSource ?? 'missing',
      ip,
      userAgent,
    })
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
  }

  try {
    const body = await request.json()
    const { id, publicId } = body as { id?: string; publicId?: string }

    if (!id && !publicId) {
      return new Response(JSON.stringify({ error: 'Missing id or publicId' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }

    if (publicId && process.env.CLOUDINARY_API_KEY) {
      try {
        await cloudinary.uploader.destroy(publicId, { resource_type: 'image' })
      } catch (cloudErr) {
        console.warn('[portfolio-delete] Cloudinary delete failed', cloudErr)
      }
    }

    await appendUploadLog({ type: 'upload_delete', publicId: publicId ?? id, ip, userAgent })

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (err) {
    console.error('[portfolio-delete] error', err)
    return new Response(JSON.stringify({ error: 'Delete failed' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}
