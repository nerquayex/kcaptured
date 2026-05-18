import { getTestimonials, Testimonial } from '@/lib/testimonials-data'

export async function GET() {
  try {
    const testimonials: Testimonial[] = getTestimonials()
    return new Response(JSON.stringify(testimonials), {
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
