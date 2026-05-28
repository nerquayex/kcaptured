import { v2 as cloudinary } from 'cloudinary'
import { appendUploadLog, getClientIp } from '@/lib/logger'
import { verifyUploadToken } from '@/lib/auth-utils'
import { kv } from '@/lib/kv'

export const runtime = 'nodejs'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const MAX_FILE_SIZE = 500 * 1024 * 1024 // 500MB for video

interface TestimonialData {
  id: string
  clientName: string
  clientRole: string
  content: string
  videoUrl: string
  createdAt: string
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
      error: 'Unauthorized testimonial upload request',
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
  const videoFile = formData.get('file')
  const clientName = String(formData.get('clientName') ?? '')
  const clientRole = String(formData.get('clientRole') ?? '')
  const content = String(formData.get('content') ?? '')

  await appendUploadLog({
    type: 'upload_attempt',
    category: 'testimonial',
    fileName: videoFile instanceof File ? videoFile.name : undefined,
    fileSize: videoFile instanceof File ? videoFile.size : undefined,
    fileMimeType: videoFile instanceof File ? videoFile.type : undefined,
    ip,
    userAgent,
  })

  if (!(videoFile instanceof File)) {
    await appendUploadLog({
      type: 'upload_error',
      error: 'No video file was provided',
      category: 'testimonial',
      ip,
      userAgent,
    })
    return new Response(JSON.stringify({ error: 'No video file provided' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!videoFile.type.startsWith('video/')) {
    await appendUploadLog({
      type: 'upload_error',
      error: `Invalid file type: ${videoFile.type}`,
      fileName: videoFile.name,
      fileSize: videoFile.size,
      fileMimeType: videoFile.type,
      category: 'testimonial',
      ip,
      userAgent,
    })
    return new Response(JSON.stringify({ error: 'Invalid file type. Please upload a video.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (videoFile.size > MAX_FILE_SIZE) {
    await appendUploadLog({
      type: 'upload_error',
      error: `File too large: ${videoFile.size} bytes`,
      fileName: videoFile.name,
      fileSize: videoFile.size,
      fileMimeType: videoFile.type,
      category: 'testimonial',
      ip,
      userAgent,
    })
    return new Response(JSON.stringify({ error: 'Video file is too large. Maximum size is 500MB.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!clientName || !clientRole || !content) {
    return new Response(
      JSON.stringify({ error: 'Client name, role, and content are required' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }

  try {
    // Convert video file to buffer
    const arrayBuffer = await videoFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Create unique ID with timestamp for ordering
    const timestamp = Date.now()
    const publicId = `testimonial-${timestamp}`
    
    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'testimonials',
          resource_type: 'video',
          public_id: publicId,
          context: `clientName=${clientName}|clientRole=${clientRole}|content=${content}`,
          // Add tags for organization
          tags: ['client-testimonial', 'user-submitted'],
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      )

      uploadStream.end(buffer)
    })

    const result = uploadResult as any

    // Create testimonial data
    const testimonialData: TestimonialData = {
      id: publicId,
      clientName,
      clientRole,
      content,
      videoUrl: result.secure_url,
      createdAt: new Date().toISOString(),
    }

    // Persist testimonial metadata in Vercel KV so Vercel can serve structured testimonial data.
    try {
      const existingTestimonials = (await kv.get<TestimonialData[]>('testimonials')) ?? []
      await kv.set('testimonials', [...existingTestimonials, testimonialData])
    } catch (kvError) {
      console.warn('[testimonial-upload] Failed to persist testimonial in KV:', kvError)
    }

    await appendUploadLog({
      type: 'upload_success',
      category: 'testimonial',
      fileName: videoFile.name,
      fileSize: videoFile.size,
      fileMimeType: videoFile.type,
      ip,
      userAgent,
    })

    return new Response(JSON.stringify({ success: true, testimonial: testimonialData }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Testimonial upload error:', error)
    await appendUploadLog({
      type: 'upload_error',
      error: `Cloudinary upload failed: ${error instanceof Error ? error.message : String(error)}`,
      fileName: videoFile.name,
      fileSize: videoFile.size,
      fileMimeType: videoFile.type,
      category: 'testimonial',
      ip,
      userAgent,
    })

    return new Response(JSON.stringify({ error: 'Failed to upload testimonial video. Please try again.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
