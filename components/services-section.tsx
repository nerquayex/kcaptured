"use client";

import React, { useState } from 'react'
import type { Service } from '@/lib/services-data';
import { CheckCircle, Grid, List } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { BookingForm } from '@/components/booking-form';

export function ServicesSection() {
  const MotionButton = motion.create(Button);
  const [services, setServices] = useState<Service[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [displayMode, setDisplayMode] = useState<'grid' | 'list'>('grid');
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState('');

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
    <section
      className="py-16 md:py-24 relative"
      style={{
        backgroundImage: 'url(https://res.cloudinary.com/dq4tkpuu4/image/upload/v1773520574/kcompressed_iul9zi.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="absolute inset-0 bg-black/80" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Services
          </h2>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
            Professional photography packages tailored to your needs.
          </p>
        </motion.div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-10">
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
                whileHover={{ scale: 1.03 }}
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
        </div>

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

      <BookingForm isOpen={bookingOpen} initialPackage={selectedPackage} onClose={() => setBookingOpen(false)} onSaved={() => { window.location.href = 'https://www.instagram.com/kcaptures_.1' }} />
    </section>
  );
}
