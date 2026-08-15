'use client'

import { TestimonialsManager } from '@/components/testimonials-manager'

export default function AdminTestimonialsPage() {
  return (
    <div className="py-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.35em] text-primary">Testimonials</p>
          <h1 className="mt-3 text-3xl font-semibold">Manage client testimonials and testimonial videos.</h1>
          <p className="mt-2 text-gray-300">Testimonials are currently stored via Cloudinary and static files. Full DB-backed testimonials will come later.</p>
        </div>
        <TestimonialsManager />
      </div>
    </div>
  )
}
