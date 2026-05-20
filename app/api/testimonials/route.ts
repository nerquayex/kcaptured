import { getTestimonials as getStaticTestimonials } from '@/lib/testimonials-data'
import { getUploadedTestimonials } from '@/lib/cloudinary-uploads'

export async function GET() {
  try {
    const staticTestimonials = getStaticTestimonials()
    const uploadedTestimonials = await getUploadedTestimonials()
    // Combine uploaded testimonials first (most recent), then static ones
    const allTestimonials = [...uploadedTestimonials, ...staticTestimonials]
    return new Response(JSON.stringify(allTestimonials), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Failed to get testimonials:', error)
    return new Response(JSON.stringify({ error: 'Failed to load testimonials' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
