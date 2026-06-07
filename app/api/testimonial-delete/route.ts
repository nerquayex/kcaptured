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
      error: 'Unauthorized testimonial delete request',
      uploadSource: uploadSource ?? 'missing',
      ip,
      userAgent,
    })
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
  }

  try {
    const body = await request.json()
    const { id, videoPublicId } = body as { id?: string; videoPublicId?: string }

    if (!id && !videoPublicId) {
      return new Response(JSON.stringify({ error: 'Missing id or videoPublicId' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }

    // Attempt to delete from Cloudinary if public id provided
    if (videoPublicId && process.env.CLOUDINARY_API_KEY) {
      try {
        await cloudinary.uploader.destroy(videoPublicId, { resource_type: 'video' })
      } catch (cloudErr) {
        console.warn('[testimonial-delete] Cloudinary delete failed', cloudErr)
      }
    }

    await appendUploadLog({ type: 'upload_delete', publicId: id ?? videoPublicId, ip, userAgent })

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (err) {
    console.error('[testimonial-delete] error', err)
    return new Response(JSON.stringify({ error: 'Delete failed' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}
