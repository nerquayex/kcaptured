import { v2 as cloudinary } from 'cloudinary'
import { PortfolioImage } from '@/lib/portfolio-data'

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
