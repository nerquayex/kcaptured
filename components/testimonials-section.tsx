'use client';

import { testimonials } from '@/lib/testimonials-data';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const current = testimonials[currentIndex];

  return (
    <section 
      className="py-16 md:py-24 relative"
      style={{
        backgroundImage: 'url(https://res.cloudinary.com/dq4tkpuu4/image/upload/v1773520574/kcompressed_iul9zi.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/75" />
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Client Testimonials
          </h2>
          <p className="text-xl text-gray-200">
            Hear from those who trust us with their special moments
          </p>
        </div>

        {/* Testimonial Carousel */}
        <div className="bg-black/60 backdrop-blur-sm rounded-lg p-8 md:p-12 shadow-md border border-gray-700">
          {/* Video/Content Area */}
          {current.videoUrl && (
            <div className="mb-8 rounded-lg overflow-hidden bg-black aspect-video flex items-center justify-center max-w-2xl mx-auto">
              <video
                src={current.videoUrl}
                controls
                className="w-full h-full object-contain"
              />
            </div>
          )}

          {/* Testimonial Text */}
          <div className="text-center mb-8">
            <p className="text-xl text-gray-200 italic mb-6">
              "{current.content}"
            </p>
            <div className="space-y-1">
              <p className="font-semibold text-lg text-white">
                {current.clientName}
              </p>
              <p className="text-gray-400">
                {current.clientRole}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={prev}
              size="icon"
              className="bg-transparent border-white text-white hover:bg-white hover:text-black"
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={24} />
            </Button>

            <div className="flex gap-2">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    idx === currentIndex ? 'bg-white' : 'bg-gray-600'
                  }`}
                  aria-label={`Go to testimonial ${idx + 1}`}
                />
              ))}
            </div>

            <Button
              onClick={next}
              size="icon"
              className="bg-transparent border-white text-white hover:bg-white hover:text-black"
              aria-label="Next testimonial"
            >
              <ChevronRight size={24} />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
