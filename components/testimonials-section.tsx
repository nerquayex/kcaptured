'use client';

import { Testimonial } from '@/lib/testimonials-data';
import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, useScroll, useTransform } from 'framer-motion';

export function TestimonialsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], [-56, 56]);
  const imageScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.08, 1, 1.04]);
  const contentY = useTransform(scrollYProgress, [0, 0.35, 1], [72, 0, -32]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.18, 0.85, 1], [0, 1, 1, 0.82]);
  const topWashY = useTransform(scrollYProgress, [0, 0.35], ['0%', '-55%']);
  const bottomWashOpacity = useTransform(scrollYProgress, [0.55, 1], [0, 1]);

  useEffect(() => {
    async function loadTestimonials() {
      try {
        const response = await fetch('/api/testimonials');
        if (!response.ok) {
          throw new Error('Failed to load testimonials');
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error('Unexpected testimonials response');
        }
        setTestimonials(data);
      } catch (error) {
        console.error('Failed to load testimonials:', error);
        setTestimonials([]);
      } finally {
        setLoading(false);
      }
    }

    loadTestimonials();
  }, []);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  if (loading) {
    return null;
  }

  if (testimonials.length === 0) {
    return <section className="bg-black py-16 text-center text-gray-400">No testimonials available yet.</section>;
  }

  const current = testimonials[currentIndex];

  return (
    <motion.section
      ref={sectionRef}
      className="relative overflow-hidden py-16 md:py-24"
    >
      <motion.div
        className="absolute inset-[-12%] bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://res.cloudinary.com/dq4tkpuu4/image/upload/v1773520574/kcompressed_iul9zi.jpg)',
          y: imageY,
          scale: imageScale,
        }}
      />
      <div className="absolute inset-0 bg-black/75" />
      <motion.div
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#951025] to-transparent"
        style={{ y: topWashY }}
      />
      <motion.div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-[#0c0c0c]"
        style={{ opacity: bottomWashOpacity }}
      />

      <motion.div
        className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"
        style={{ y: contentY, opacity: contentOpacity }}
      >
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 34 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.5 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Client Testimonials
          </h2>
          <p className="text-xl text-gray-200">
            Hear from those who trust us with their special moments
          </p>
        </motion.div>

        <motion.div
          className="bg-black/60 backdrop-blur-sm rounded-lg p-8 md:p-12 shadow-md border border-gray-700"
          initial={{ opacity: 0, y: 46, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: false, amount: 0.35 }}
          transition={{ duration: 0.78, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ y: -4 }}
        >
          {current.videoUrl && (
            <div className="mb-8 rounded-lg overflow-hidden bg-black aspect-video flex items-center justify-center max-w-2xl mx-auto">
              <video
                src={current.videoUrl}
                controls
                className="w-full h-full object-contain"
              />
            </div>
          )}

          <div className="text-center mb-8 space-y-1">
            <p className="font-semibold text-lg text-white">
              {current.clientName}
            </p>
            <p className="text-gray-400">{current.clientRole}</p>
          </div>

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
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
