'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

export function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], [0, 56]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.35]);
  const labelOpacity = useTransform(scrollYProgress, [0, 0.62, 0.86], [1, 0.72, 0]);
  const labelY = useTransform(scrollYProgress, [0, 1], [0, -96]);
  const labelScale = useTransform(scrollYProgress, [0, 1], [1, 0.88]);
  const curtainY = useTransform(scrollYProgress, [0, 1], ['18%', '-28%']);

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
      <section ref={sectionRef} className="relative -mt-16 overflow-hidden bg-[#951025]">
        <motion.img
          src={imageUrl}
          alt="Hero"
          className="block w-full h-auto origin-center object-contain select-none pointer-events-none will-change-transform"
          style={{ y: imageY, scale: imageScale }}
        />

        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/40"
          style={{ opacity: overlayOpacity }}
        />
        <motion.div
          className="absolute inset-x-0 -bottom-1 h-48 bg-gradient-to-b from-transparent via-[#951025]/75 to-[#951025]"
          style={{ y: curtainY }}
        />
        <motion.div
          className="absolute inset-x-0 bottom-0 h-20 origin-bottom bg-[#951025]"
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: false, amount: 0.15 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
      </section>

      <motion.div
        className="fixed inset-0 z-10 flex items-center justify-center px-4 py-24 pointer-events-none will-change-transform"
        style={{ opacity: labelOpacity, y: labelY, scale: labelScale }}
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-5xl w-full mx-auto px-4 text-white flex justify-center"
        >
          <motion.h1
            variants={itemVariants}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-tight tracking-tight whitespace-normal max-w-[80vw] mx-auto text-center kcv-heading"
            style={{ color: 'transparent', display: 'inline-block' }}
          >
            KCAPTURED VISUALS
          </motion.h1>

        </motion.div>
      </motion.div>
    </>
  );
}
