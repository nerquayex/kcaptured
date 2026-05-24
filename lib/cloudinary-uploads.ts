import { v2 as cloudinary } from 'cloudinary'
import { readFileSync } from 'fs'
import { join } from 'path'
import { PortfolioImage } from '@/lib/portfolio-data'

export interface Testimonial {
  id: string
  clientName: string
  clientRole: string
  content: string
  videoUrl: string
  imageUrl?: string
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

function parseCategoryFromResource(resource: any) {
  const prefix = 'client-uploads/'
  const folder = String(resource.folder ?? '')
  const publicId = String(resource.public_id ?? '')
  const tags = Array.isArray(resource.tags)
    ? (resource.tags as string[]).map(String)
    : []

  if (folder.startsWith(prefix)) {
    return folder.slice(prefix.length).split('/')[0] || 'uncategorized'
  }

  if (publicId.startsWith(prefix)) {
    return publicId.slice(prefix.length).split('/')[0] || 'uncategorized'
  }

  const knownCategoryTag = tags.find((tag: string) =>
    ['studio', 'lifestyle', 'event', 'portrait'].includes(tag),
  )

  if (knownCategoryTag) {
    return knownCategoryTag
  }

  return 'uncategorized'
}

export async function getClientUploads(): Promise<PortfolioImage[]> {
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    return []
  }

  try {
    const response = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'client-uploads',
      max_results: 200,
      resource_type: 'image',
      direction: 'desc',
    })

    return (response.resources ?? []).map((resource: any) => {
      const category = parseCategoryFromResource(resource)
      const title = String(resource.public_id).split('/').pop() ?? String(resource.public_id)

      return {
        id: `cloudinary-${resource.public_id}`,
        cloudinaryUrl: String(resource.secure_url),
        category,
        title,
        width: Number(resource.width) || 800,
        height: Number(resource.height) || 600,
      }
    })
  } catch (error) {
    console.error('[cloudinary-uploads] failed to fetch client uploads', error)
    return []
  }
}

export async function getUploadedTestimonials(): Promise<Testimonial[]> {
  // First, try to get testimonials from the stored JSON file
  try {
    const filePath = join(process.cwd(), 'lib', 'testimonials-data.json')
    const content = readFileSync(filePath, 'utf-8')
    const storedTestimonials = JSON.parse(content) as Array<{
      id: string
      clientName: string
      clientRole: string
      content: string
      videoUrl: string
      createdAt: string
    }>
    
    return storedTestimonials.map((testimonial) => ({
      id: `stored-${testimonial.id}`,
      clientName: testimonial.clientName,
      clientRole: testimonial.clientRole,
      content: testimonial.content,
      videoUrl: testimonial.videoUrl,
      imageUrl: 'https://via.placeholder.com/100x100',
    }))
  } catch (fileError) {
    console.warn('[cloudinary-uploads] No stored testimonials found, fetching from Cloudinary only')
  }

  // Fallback: get testimonials from Cloudinary (with basic data)
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    return []
  }

  try {
    const response = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'testimonials',
      max_results: 100,
      resource_type: 'video',
      direction: 'desc',
    })

    return (response.resources ?? []).map((resource: any, index: number) => ({
      id: `cloudinary-testimonial-${resource.public_id}`,
      clientName: `Client ${index + 1}`,
      clientRole: 'Testimonial',
      content: 'Video testimonial from our valued client',
      videoUrl: String(resource.secure_url),
      imageUrl: 'https://via.placeholder.com/100x100',
    }))
  } catch (error) {
    console.error('[cloudinary-uploads] failed to fetch testimonials', error)
    return []
  }
}
