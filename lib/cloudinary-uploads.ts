import { v2 as cloudinary } from 'cloudinary'
import { PortfolioImage } from '@/lib/portfolio-data'

export interface Testimonial {
  id: string
  clientName: string
  clientRole: string
  content: string
  videoUrl?: string
  videoPublicId?: string
  imageUrl?: string
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

function parseContextCategory(resource: any) {
  const fallback = null
  if (!resource?.context) return fallback

  const context = resource.context
  const custom = context.custom ?? context

  if (custom && typeof custom === 'object') {
    const categoryValue = custom.category ?? custom.Category ?? custom.category?.[0]
    if (typeof categoryValue === 'string') {
      return categoryValue.trim() || fallback
    }
    if (Array.isArray(categoryValue) && categoryValue.length > 0) {
      return String(categoryValue[0]).trim() || fallback
    }
  }

  if (typeof context === 'string') {
    const entries = String(context)
      .split('|')
      .map((pair: string) => pair.split('=').map((part) => part.trim()))
      .filter((pair) => pair.length === 2)

    const data = Object.fromEntries(entries)
    return String(data.category ?? '').trim() || fallback
  }

  return fallback
}

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

  const contextCategory = parseContextCategory(resource)
  if (contextCategory) {
    return contextCategory
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
      context: true,
      tags: true,
    })

    return (response.resources ?? []).map((resource: any) => {
      const category = parseCategoryFromResource(resource)
      const title = String(resource.public_id).split('/').pop() ?? String(resource.public_id)

      return {
        id: `cloudinary-${resource.public_id}`,
        cloudinaryUrl: String(resource.secure_url),
        publicId: String(resource.public_id),
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

function parseTestimonialMetadata(resource: any) {
  const fallback = {
    clientName: 'Client',
    clientRole: 'Testimonial',
    content: 'Video testimonial from our valued client',
  }

  if (!resource?.context) {
    return fallback
  }

  const customContext = resource.context.custom
  if (customContext && typeof customContext === 'object') {
    return {
      clientName: String(customContext.clientName ?? fallback.clientName),
      clientRole: String(customContext.clientRole ?? fallback.clientRole),
      content: String(customContext.content ?? fallback.content),
    }
  }

  if (typeof resource.context === 'string') {
    const entries = String(resource.context)
      .split('|')
      .map((pair: string) => pair.split('=').map((part) => part.trim()))
      .filter((pair) => pair.length === 2)

    const data = Object.fromEntries(entries)
    return {
      clientName: String(data.clientName ?? fallback.clientName),
      clientRole: String(data.clientRole ?? fallback.clientRole),
      content: String(data.content ?? fallback.content),
    }
  }

  return fallback
}

export async function getUploadedTestimonials(): Promise<Testimonial[]> {
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
      context: true,
      tags: true,
    })

    return (response.resources ?? []).map((resource: any, index: number) => {
      const parsed = parseTestimonialMetadata(resource)
      return {
        id: `cloudinary-testimonial-${resource.public_id}`,
        clientName: parsed.clientName || `Client ${index + 1}`,
        clientRole: parsed.clientRole || 'Testimonial',
        content: parsed.content || 'Video testimonial from our valued client',
        videoUrl: String(resource.secure_url),
        videoPublicId: resource.public_id,
        imageUrl: 'https://via.placeholder.com/100x100',
      }
    })
  } catch (error) {
    console.error('[cloudinary-uploads] failed to fetch testimonials', error)
    return []
  }
}
