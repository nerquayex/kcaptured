'use client';

import { portfolioImages } from '@/lib/portfolio-data';
import { useState } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function MasonryGallery() {
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
          <motion.button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              selectedCategory === cat.value
                ? 'bg-black dark:bg-white text-white dark:text-black'
                : 'bg-gray-200 dark:bg-gray-800 text-black dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            {cat.label}
          </motion.button>
        ))}
      </div>

      {/* Masonry Grid */}
      <motion.div
        layout
        className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4"
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
              className="break-inside-avoid mb-4 cursor-pointer group overflow-hidden rounded-lg"
              onClick={() => setSelectedImage(image)}
            >
              <div className="relative bg-gray-200 dark:bg-gray-700 overflow-hidden rounded-lg">
                <img
                  src={image.cloudinaryUrl}
                  alt={image.title}
                  width={image.width}
                  height={image.height}
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
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
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedImage(null)}
                className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
                aria-label="Close lightbox"
              >
                <X size={32} />
              </motion.button>

              {/* Image */}
              <img
                src={selectedImage.cloudinaryUrl}
                alt={selectedImage.title}
                className="w-full h-auto rounded-lg"
              />

              {/* Info */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mt-4 text-white"
              >
                <h3 className="text-2xl font-bold">{selectedImage.title}</h3>
                {selectedImage.description && (
                  <p className="text-gray-300 mt-2">{selectedImage.description}</p>
                )}
                <p className="text-sm text-gray-400 mt-2 capitalize">
                  {selectedImage.category}
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
