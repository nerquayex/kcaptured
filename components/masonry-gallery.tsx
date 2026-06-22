'use client';

import { PortfolioImage } from '@/lib/portfolio-data';
import { optimizeCloudinaryUrl } from '@/lib/utils';
import { useMemo, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface MasonryGalleryProps {
  images: PortfolioImage[]
}

export function MasonryGallery({ images }: MasonryGalleryProps) {
  const MotionButton = motion.create(Button);

  const [selectedCategory, setSelectedCategory] = useState('all');

  const categoryOptions = useMemo(() => {
    const categories = Array.from(
      new Set(images.map((image) => image.category).filter((category) => category !== 'uncategorized')),
    )
    return [
      { value: 'all', label: 'All Work' },
      ...categories.map((category) => ({
        value: category,
        label: category.charAt(0).toUpperCase() + category.slice(1),
      })),
    ]
  }, [images])

  const filteredImages =
    selectedCategory === 'all'
      ? images
      : images.filter((img) => img.category === selectedCategory)

  return (
    <>
      {/* Category Filters */}
      <div className="flex justify-center gap-2 sm:gap-4 mb-12 flex-wrap">
        {categoryOptions.map((cat) => (
          <MotionButton
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-3 sm:px-6 py-1 sm:py-2 text-sm sm:text-base rounded-lg font-medium transition-all ${
              selectedCategory === cat.value
                ? 'bg-white text-black'
                : 'bg-transparent text-white'
            }`}
          >
            {cat.label}
          </MotionButton>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 justify-items-center">
        {filteredImages.map((image) => (
          <div key={image.id} className="overflow-hidden w-full max-w-[398px]">
            <div className="relative w-full aspect-[319/398] overflow-hidden bg-black">
              {image.cloudinaryUrl ? (
                <Image
                  src={optimizeCloudinaryUrl(image.cloudinaryUrl)}
                  alt={image.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  priority={filteredImages.indexOf(image) < 3}
                  unoptimized
                  className="object-cover object-center transition-transform duration-300 hover:scale-105"
                />
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
