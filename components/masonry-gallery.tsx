'use client';

import { portfolioImages } from '@/lib/portfolio-data';
import { optimizeCloudinaryUrl } from '@/lib/utils';
import { useState } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

export function MasonryGallery() {
  const MotionButton = motion(Button);

  const [selectedCategory, setSelectedCategory] = useState<'all' | 'lifestyle' | 'studio'>('all');
  const [selectedImage, setSelectedImage] = useState<typeof portfolioImages[0] | null>(null);

  const filteredImages =
    selectedCategory === 'all'
      ? portfolioImages
      : portfolioImages.filter((img) => img.category === selectedCategory);

  const categories = [
    { value: 'all' as const, label: 'All Work' },
    { value: 'lifestyle' as const, label: 'Lifestyle' },
    { value: 'studio' as const, label: 'Studio' },
  ];

  return (
    <>
      {/* Category Filters */}
      <div className="flex justify-center gap-4 mb-12">
        {categories.map((cat) => (
          <MotionButton
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              selectedCategory === cat.value
                ? 'bg-white text-black'
                : 'bg-transparent text-white'
            }`}
          >
            {cat.label}
          </MotionButton>
        ))}
      </div>

      {/* Masonry Grid */}
      <motion.div
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      >
        <AnimatePresence mode="popLayout">
          {filteredImages.map((image) => (
            <motion.div
              key={image.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="cursor-pointer group overflow-hidden rounded-lg"
              onClick={() => setSelectedImage(image)}
            >
              <div
                className="relative bg-gray-200 dark:bg-gray-700 overflow-hidden rounded-lg"
                style={{ aspectRatio: image.width / image.height }}
              >
                <Image
                  src={optimizeCloudinaryUrl(image.cloudinaryUrl)}
                  alt={image.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  priority={filteredImages.indexOf(image) < 3}
                  unoptimized
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative max-w-4xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <MotionButton
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedImage(null)}
                size="icon"
                className="absolute -top-10 right-0 bg-transparent border-white text-white hover:bg-white hover:text-black"
                aria-label="Close lightbox"
              >
                <X size={32} />
              </MotionButton>

              {/* Image */}
              <Image
                src={optimizeCloudinaryUrl(selectedImage.cloudinaryUrl)}
                alt={selectedImage.title}
                width={selectedImage.width}
                height={selectedImage.height}
                unoptimized
                className="w-full h-auto max-h-[80vh] max-w-2xl rounded-lg mx-auto"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
