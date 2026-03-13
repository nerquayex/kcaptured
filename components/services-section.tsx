'use client';

import { services } from '@/lib/services-data';
import { CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

export function ServicesSection() {
  const [selectedCategory, setSelectedCategory] = useState<'lifestyle' | 'studio' | 'all'>('all');

  const filteredServices = selectedCategory === 'all' 
    ? services 
    : services.filter(s => s.category === selectedCategory);

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
        backgroundImage: 'url(https://res.cloudinary.com/dq4tkpuu4/image/upload/v1773348310/35-2W1A0773__2_jjv1ug.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/75" /    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Services
          </h2>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto">
            Professional photography packages tailored to your needs
          </p>
        </motion.div>

        {/* Category Filter */}
        <div className="flex justify-center gap-4 mb-12">
          {[
            { label: 'All Services', value: 'all' },
            { label: 'Lifestyle', value: 'lifestyle' },
            { label: 'Studio', value: 'studio' },
          ].map((cat) => (
            <motion.button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value as 'lifestyle' | 'studio' | 'all')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                selectedCategory === cat.value
                  ? 'bg-white text-black'
                  : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              {cat.label}
            </motion.button>
          ))}
        </div>

        {/* Services Grid */}
        <motion.div
          key={selectedCategory}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredServices.map((service) => (
            <motion.div
              key={service.id}
              variants={itemVariants}
              className="border border-gray-600 rounded-lg p-6 hover:shadow-lg hover:shadow-white/20 transition-shadow bg-black/60 backdrop-blur-sm"
            >
              <span className="inline-block px-3 py-1 bg-white text-black text-xs font-medium rounded-full mb-3 capitalize">
                {service.category}
              </span>
              
              <h3 className="text-xl font-bold text-white mb-2">
                {service.name}
              </h3>
              
              <p className="text-gray-300 text-sm mb-4">
                {service.duration}
              </p>

              <div className="mb-6 pb-6 border-b border-gray-600">
                <p className="text-3xl font-bold text-white">
                  ${service.price}
                </p>
              </div>

              <ul className="space-y-3">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle size={18} className="text-white flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
