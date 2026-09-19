'use client';

import Image from 'next/image';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useEffect, useRef, useState } from 'react';

export function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [labelOpacity, setLabelOpacity] = useState(1);
  const { scrollY } = useScroll();
  const [sectionHeight, setSectionHeight] = useState(0);

  useEffect(() => {
    const updateHeight = () => {
      if (sectionRef.current) {
        setSectionHeight(sectionRef.current.offsetHeight);
      }
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    if (sectionHeight > 0) {
      const opacity = Math.max(0, 1 - latest / (sectionHeight * 0.8));
      setLabelOpacity(opacity);
    }
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  };

  const imageUrl = 'https://res.cloudinary.com/dq4tkpuu4/image/upload/v1781263118/IMG_5187_hdozar.jpg';

  return (
    <>
      <section ref={sectionRef} className="relative overflow-hidden bg-red -mt-16">
      <img
        src={imageUrl}
        alt="Hero"
        className="block w-full h-auto object-contain select-none pointer-events-none"
      />

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/40" />

      </section>

      <div className="fixed inset-0 z-10 flex items-center justify-center px-4 py-24 pointer-events-none" style={{ opacity: labelOpacity }}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-5xl w-full mx-auto px-4 text-white flex justify-center"
        >
          <motion.h1
            variants={itemVariants}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-tight tracking-tight whitespace-normal max-w-[80vw] mx-auto text-center"
            style={{ color: 'transparent', WebkitTextStroke: '1.2px white', textStroke: '1.2px white', display: 'inline-block' }}
          >
            KCAPTURED VISUALS
          </motion.h1>

        </motion.div>
      </div>
    </>
  );
}
