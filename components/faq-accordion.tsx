'use client';

import { FAQItem } from '@/lib/faq-data';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FAQAccordionProps {
  items: FAQItem[];
}

export function FAQAccordion({ items }: FAQAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  const groupedByCategory = items.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, FAQItem[]>
  );

  return (
    <div className="space-y-8">
      {Object.entries(groupedByCategory).map(([category, categoryItems]) => (
        <div key={category}>
          <h3 className="text-2xl font-bold text-white mb-4">
            {category}
          </h3>

          <div className="space-y-3">
            {categoryItems.map((item) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5 shadow-[0_30px_60px_-40px_rgba(255,255,255,0.2)]"
              >
                <Button
                  onClick={() =>
                    setOpenId(openId === item.id ? null : item.id)
                  }
                  className="w-full justify-between text-left bg-white/5 backdrop-blur-xl border border-white/10 text-white hover:bg-white/10"
                  variant="default"
                >
                  <span className="font-semibold">
                    {item.question}
                  </span>
                  <ChevronDown
                    size={20}
                    className={`flex-shrink-0 transition-transform ${
                      openId === item.id ? 'rotate-180' : ''
                    }`}
                  />
                </Button>

                {openId === item.id && (
                  <div className="px-6 py-5 bg-black/60 border-t border-white/10">
                    <p className="text-gray-300 leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
