import { v2 as cloudinary } from 'cloudinary'
import { appendUploadLog, getClientIp } from '@/lib/logger'
import { verifyUploadToken } from '@/lib/auth-utils'

export const runtime = 'nodejs'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 50 * 1024 * 1024

function getAllowedCategories() {
  return (process.env.NEXT_PUBLIC_UPLOAD_CATEGORIES ?? 'studio,lifestyle,event,portrait')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

export async function POST(request: Request) {
  const ip = getClientIp(request)
  const userAgent = request.headers.get('user-agent') ?? 'unknown'
  const authHeader = request.headers.get('authorization') ?? ''
  const token = authHeader.replace(/^Bearer\s+/i, '')
  const uploadSource = request.headers.get('x-upload-source')

  if (!token || uploadSource !== 'kc-upload' || !verifyUploadToken(token)) {
    await appendUploadLog({
      type: 'upload_error',
      error: 'Unauthorized upload request',
      uploadSource: uploadSource ?? 'missing',
      ip,
      userAgent,
    })
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const formData = await request.formData()
  const fileEntry = formData.get('file')
  const category = String(formData.get('category') ?? 'uncategorized')
  const allowedCategories = getAllowedCategories()

  await appendUploadLog({
    type: 'upload_attempt',
    category,
    fileName: fileEntry instanceof File ? fileEntry.name : undefined,
    fileSize: fileEntry instanceof File ? fileEntry.size : undefined,
    fileMimeType: fileEntry instanceof File ? fileEntry.type : undefined,
    ip,
    userAgent,
  })

  if (!(fileEntry instanceof File)) {
    await appendUploadLog({
      type: 'upload_error',
      error: 'No file was provided',
      category,
      ip,
      userAgent,
    })
    return new Response(JSON.stringify({ error: 'No file provided' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!ALLOWED_MIME_TYPES.includes(fileEntry.type)) {
    await appendUploadLog({
      type: 'upload_error',
      error: `Invalid file type: ${fileEntry.type}`,
      fileName: fileEntry.name,
      fileSize: fileEntry.size,
      fileMimeType: fileEntry.type,
      category,
      ip,
      userAgent,
    })
    return new Response(JSON.stringify({ error: 'Invalid file type' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (fileEntry.size > MAX_FILE_SIZE) {
    await appendUploadLog({
      type: 'upload_error',
      error: `File too large: ${fileEntry.size} bytes`,
      fileName: fileEntry.name,
      fileSize: fileEntry.size,
      fileMimeType: fileEntry.type,
      category,
      ip,
      userAgent,
    })
    return new Response(JSON.stringify({ error: 'File too large' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const normalizedCategory = allowedCategories.includes(category) ? category : 'uncategorized'

  const uploadResult = await new Promise<any>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `client-uploads/${normalizedCategory}`,
        resource_type: 'image',
        context: `category=${normalizedCategory}`,
        tags: [normalizedCategory, 'client-upload'],
      },
      (error, result) => {
        if (error) {
          reject(error)
        } else {
          resolve(result)
        }
      },
    )

    fileEntry.arrayBuffer().then((buffer) => {
      uploadStream.end(Buffer.from(buffer))
    }, reject)
  })

  if (!uploadResult?.secure_url) {
    await appendUploadLog({
      type: 'upload_error',
      error: 'Cloudinary did not return a secure URL',
      fileName: fileEntry.name,
      fileSize: fileEntry.size,
      fileMimeType: fileEntry.type,
      category: normalizedCategory,
      ip,
      userAgent,
    })
    return new Response(JSON.stringify({ error: 'Upload failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  await appendUploadLog({
    type: 'upload_success',
    fileName: fileEntry.name,
    fileSize: fileEntry.size,
    fileMimeType: fileEntry.type,
    category: normalizedCategory,
    publicId: uploadResult.public_id,
    url: uploadResult.secure_url,
    ip,
    userAgent,
  })

  return new Response(
    JSON.stringify({
      success: true,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    },
  )
}
