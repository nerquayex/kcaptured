import { v2 as cloudinary } from 'cloudinary'
import { appendUploadLog, getClientIp } from '@/lib/logger'
import { verifyUploadToken } from '@/lib/auth-utils'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

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

function getTestimonialsFilePath() {
  return join(process.cwd(), 'lib', 'testimonials-data.json')
}

async function addTestimonialToFile(testimonial: TestimonialData) {
  try {
    const filePath = getTestimonialsFilePath()
    let existing: TestimonialData[] = []

    try {
      const content = readFileSync(filePath, 'utf-8')
      existing = JSON.parse(content)
    } catch {
      // File doesn't exist yet, start with empty array
      existing = []
    }

    existing.push(testimonial)
    writeFileSync(filePath, JSON.stringify(existing, null, 2))
  } catch (error) {
    console.error('Failed to write testimonial to file:', error)
    throw error
  }
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

    // Upload to Cloudinary with metadata
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'testimonials',
          resource_type: 'video',
          public_id: `testimonial-${Date.now()}`,
          // Store metadata on the resource for retrieval
          metadata: {
            client_name: clientName,
            client_role: clientRole,
            content: content,
          },
          // Also add as tags for organizational purposes
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
      id: `testimonial-${Date.now()}`,
      clientName,
      clientRole,
      content,
      videoUrl: result.secure_url,
      createdAt: new Date().toISOString(),
    }

    // Add to testimonials file (best effort - don't fail if it errors)
    try {
      await addTestimonialToFile(testimonialData)
    } catch (fileError) {
      console.warn('[testimonial-upload] Failed to write testimonial file (this is OK on Vercel):', fileError)
      // Continue anyway - video is already in Cloudinary
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
