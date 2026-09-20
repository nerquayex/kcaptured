"use client";

import React, { useRef, useState } from 'react'
import Image from 'next/image';
import type { Service } from '@/lib/services-data';
import { Grid, List } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { BookingForm } from '@/components/booking-form';
import { Skeleton } from '@/components/ui/skeleton';
import { optimizeCloudinaryUrl } from '@/lib/utils';

export function ServicesSection() {
  const MotionButton = motion.create(Button);
  const sectionRef = useRef<HTMLElement>(null);
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true);
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
        if (!res.ok) {
          if (mounted) setServices([])
          return
        }
        const data = await res.json()
        if (mounted) setServices(Array.isArray(data) ? data : [])
      } catch {
        if (mounted) setServices([])
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  // Default to list view on large screens and respond to breakpoint changes
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(min-width: 1024px)');
    const apply = () => setDisplayMode(mq.matches ? 'list' : 'grid');
    apply();
    // prefer addEventListener for modern browsers
    if (mq.addEventListener) {
      mq.addEventListener('change', apply);
      return () => mq.removeEventListener('change', apply);
    }
    // fallback
    mq.addListener(apply);
    return () => mq.removeListener(apply);
  }, []);

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

  const skeletonItems = Array.from({ length: displayMode === 'grid' ? 4 : 3 });

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
          className={displayMode === 'grid' ? 'grid grid-cols-2 gap-3 sm:gap-5 lg:gap-6' : 'flex flex-col gap-6'}
        >
          {loading ? (
            skeletonItems.map((_, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="rounded-2xl border border-white/10 bg-black/60 p-4 backdrop-blur-xl sm:rounded-[28px] sm:p-6"
              >
                {displayMode === 'grid' ? (
                  <div className="space-y-4">
                    <Skeleton className="aspect-[4/3] w-full rounded-xl bg-white/10 sm:rounded-2xl" />
                    <div className="space-y-3">
                      <Skeleton className="h-7 w-20 bg-white/10" />
                      <Skeleton className="h-6 w-4/5 bg-white/10" />
                      <Skeleton className="h-4 w-2/3 bg-white/10" />
                      <div className="space-y-2 pt-2">
                        <Skeleton className="h-3 w-full bg-white/10" />
                        <Skeleton className="h-3 w-5/6 bg-white/10" />
                        <Skeleton className="h-3 w-4/6 bg-white/10" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-6 lg:grid-cols-[1fr_30%]">
                    <div className="space-y-4">
                      <Skeleton className="h-7 w-24 bg-white/10" />
                      <Skeleton className="h-8 w-1/2 bg-white/10" />
                      <Skeleton className="h-4 w-1/3 bg-white/10" />
                      <div className="space-y-2 pt-3">
                        <Skeleton className="h-3 w-full bg-white/10" />
                        <Skeleton className="h-3 w-4/5 bg-white/10" />
                        <Skeleton className="h-3 w-3/5 bg-white/10" />
                      </div>
                    </div>
                    <Skeleton className="hidden min-h-[220px] rounded-2xl bg-white/10 lg:block" />
                  </div>
                )}
              </motion.div>
            ))
          ) : filteredServices.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-300">No services available.</div>
          ) : filteredServices.map((service, index) => {
            const isList = displayMode === 'list';
            const hasImage = Boolean(service.sampleUrl);

            return (
              <motion.div
                key={service.id}
                variants={itemVariants}
                whileHover={{ y: isList ? -6 : -4, scale: isList ? 1.01 : 1.015 }}
                transition={{ duration: 0.3 }}
                className={`border border-white/10 bg-black/70 backdrop-blur-xl transition-shadow hover:shadow-[0_0_60px_rgba(255,255,255,0.12)] ${
                  isList
                    ? 'rounded-[32px] p-6 lg:flex lg:items-start lg:gap-6'
                    : 'rounded-2xl p-3 sm:rounded-[28px] sm:p-5'
                }`}
              >
                <div className={isList ? 'lg:flex-1' : ''}>
                  <div
                    className={`grid items-center ${isList ? 'gap-6 grid-cols-1 lg:grid-cols-[1fr_50%]' : 'gap-4'}`}
                  >
                    {hasImage && !isList && (
                      <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-white/10 bg-black sm:rounded-2xl">
                        <Image
                          src={optimizeCloudinaryUrl(service.sampleUrl!)}
                          alt={service.name}
                          fill
                          sizes="(max-width: 1024px) 50vw, 25vw"
                          priority={index < 4}
                          unoptimized
                          className="object-cover object-center"
                        />
                      </div>
                    )}

                    <div className={isList ? 'space-y-4' : 'space-y-3'}>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className={isList ? 'text-2xl font-bold text-white' : 'text-xl font-bold text-white sm:text-2xl'}>${service.price}</p>
                      </div>

                      <div>
                        <h3 className={isList ? 'text-3xl font-semibold text-white mb-2' : 'text-xl font-semibold leading-tight text-white sm:text-2xl'}>{service.name}</h3>
                        <p className="text-sm text-gray-300">{service.duration}</p>
                      </div>

                      <div className={isList ? 'border-b border-white/10 my-4' : 'border-b border-white/10'} />

                      <ul className={isList ? 'space-y-3' : 'space-y-2'}>
                        {service.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <span className="mt-1 text-white/80">•</span>
                            <span className={isList ? 'text-sm text-gray-300' : 'text-xs leading-relaxed text-gray-300 sm:text-sm'}>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <Button
                        className={isList ? 'w-full md:w-auto px-6 py-3 text-sm font-semibold' : 'w-full px-3 py-2 text-xs font-semibold sm:px-5 sm:py-3 sm:text-sm'}
                        onClick={() => {
                          setSelectedPackage(service.name)
                          setBookingOpen(true)
                        }}
                      >
                        Book Now on Instagram
                      </Button>
                    </div>

                    {hasImage && isList && (
                      <div className="relative w-full h-64 lg:h-[720px] overflow-hidden rounded-[32px] border border-white/10 bg-black">
                        <Image
                          src={optimizeCloudinaryUrl(service.sampleUrl!)}
                          alt={service.name}
                          fill
                          sizes="(min-width:1024px) 45vw, 100vw"
                          priority={index < 2}
                          unoptimized
                          className="object-contain"
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
