import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { TestimonialsSection } from '@/components/testimonials-section'

export const metadata = {
  title: 'Testimonials | KCAPTURED DMV Photography',
  description: 'Browse recent client testimonials from happy clients.',
}

export const revalidate = 0
export const fetchCache = 'force-no-store'

export default function TestimonialsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="py-16 md:py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-xl text-gray-300">Hear directly from our clients</p>
            <h1 className="mt-4 text-4xl font-semibold text-white">Testimonials</h1>
          </div>
          <TestimonialsSection />
        </div>
      </main>
      <Footer />
    </div>
  )
}
