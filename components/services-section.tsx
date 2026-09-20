"use client";

import React, { useRef, useState } from 'react'
import type { Service } from '@/lib/services-data';
import { Grid, List } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { BookingForm } from '@/components/booking-form';

export function ServicesSection() {
  const MotionButton = motion.create(Button);
  const sectionRef = useRef<HTMLElement>(null);
  const [services, setServices] = useState<Service[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [displayMode, setDisplayMode] = useState<'grid' | 'list'>('grid');
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState('');
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'start start'],
  });
  const topRuleScale = useTransform(scrollYProgress, [0.18, 1], [0, 1]);
  const glowY = useTransform(scrollYProgress, [0, 1], [-48, 18]);

  const filteredServices = selectedCategory === 'all'
    ? services
    : services.filter((service) => service.category === selectedCategory);

  const categories = Array.from(new Set(services.map((service) => service.category))).sort()

  React.useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch('/api/packages')
        if (!res.ok) return
        const data = await res.json()
        if (mounted) setServices(Array.isArray(data) ? data : [])
      } catch {
        if (mounted) setServices([])
      }
    })()
    return () => { mounted = false }
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <motion.section
      ref={sectionRef}
      className="relative overflow-hidden bg-[#951025] py-16 md:py-24"
    >
      <motion.div
        className="pointer-events-none absolute inset-x-0 top-0 h-px origin-left bg-white/70"
        style={{ scaleX: topRuleScale }}
      />
      <motion.div
        className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(149,16,37,0))]"
        style={{ y: glowY }}
      />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 36, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: false, amount: 0.45 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-10"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Services
          </h2>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
            Professional photography packages tailored to your needs.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.4 }}
          transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-10"
        >
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {[
              { label: 'All Services', value: 'all' },
              ...categories.map((category) => ({
                label: category.charAt(0).toUpperCase() + category.slice(1),
                value: category,
              })),
            ].map((cat) => (
              <MotionButton
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                whileHover={{ scale: 1.06, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-all border ${
                  selectedCategory === cat.value
                    ? 'bg-white text-black border-white'
                    : 'bg-transparent text-white border-white/40 hover:bg-white/10'
                }`}
              >
                {cat.label}
              </MotionButton>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDisplayMode('grid')}
              className={`inline-flex items-center justify-center h-10 w-10 rounded-full border transition ${
                displayMode === 'grid'
                  ? 'bg-white text-black border-white'
                  : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
              }`}
              aria-label="Grid view"
            >
              <Grid size={18} />
            </button>
            <button
              type="button"
              onClick={() => setDisplayMode('list')}
              className={`inline-flex items-center justify-center h-10 w-10 rounded-full border transition ${
                displayMode === 'list'
                  ? 'bg-white text-black border-white'
                  : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
              }`}
              aria-label="List view"
            >
              <List size={18} />
            </button>
          </div>
        </motion.div>

        <motion.div
          key={`${selectedCategory}-${displayMode}`}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-6"
        >
          {filteredServices.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-300">No services available.</div>
          ) : filteredServices.map((service) => {
            const isList = displayMode === 'list';

            return (
              <motion.div
                key={service.id}
                variants={itemVariants}
                whileHover={{ y: -6, scale: 1.01 }}
                transition={{ duration: 0.3 }}
                className={`rounded-[32px] border border-white/10 bg-black/70 backdrop-blur-xl transition-shadow hover:shadow-[0_0_60px_rgba(255,255,255,0.12)] p-6 ${
                  isList ? 'lg:flex lg:items-start lg:gap-6' : ''
                }`}
              >
                <div className={isList ? 'lg:flex-1' : ''}>
                  <div className={`grid gap-6 ${isList ? 'lg:grid-cols-[1fr_30%]' : 'lg:grid-cols-[40%_60%]'} items-center`}>
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-2xl font-bold text-white">${service.price}</p>
                      </div>

                      <div>
                        <h3 className="text-3xl font-semibold text-white mb-2">{service.name}</h3>
                        <p className="text-sm text-gray-300">{service.duration}</p>
                      </div>

                      <div className="border-b border-white/10 my-4" />

                      <ul className="space-y-3">
                        {service.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <span className="mt-1 text-white/80">•</span>
                            <span className="text-sm text-gray-300">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <Button
                        className="w-full md:w-auto px-6 py-3 text-sm font-semibold"
                        onClick={() => {
                          setSelectedPackage(service.name)
                          setBookingOpen(true)
                        }}
                      >
                        Book Now on Instagram
                      </Button>
                    </div>

                    {service.sampleUrl && (
                      <div className="rounded-[32px] overflow-hidden border border-white/10 bg-white/5 h-full min-h-[240px]">
                        <img
                          src={service.sampleUrl}
                          alt={service.name}
                          className="h-full w-full object-contain bg-black"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      <BookingForm isOpen={bookingOpen} initialPackage={selectedPackage} onClose={() => setBookingOpen(false)} onSaved={() => setBookingOpen(false)} />
    </motion.section>
  );
}
