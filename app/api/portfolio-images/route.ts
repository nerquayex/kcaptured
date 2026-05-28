import { getClientUploads } from '@/lib/cloudinary-uploads'
import { portfolioImages } from '@/lib/portfolio-data'

export async function GET() {
  try {
    const cloudinaryUploads = await getClientUploads()
    const images = [...cloudinaryUploads, ...portfolioImages]

    return new Response(JSON.stringify(images), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Failed to load portfolio images:', error)
    return new Response(JSON.stringify({ error: 'Failed to load portfolio images' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
