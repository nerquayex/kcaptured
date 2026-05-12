'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InstagramPolicyModalContentProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InstagramPolicyModalContent({ isOpen, onClose }: InstagramPolicyModalContentProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleProceed = () => {
    onClose();
    window.open('https://www.instagram.com/kcaptures_.1', '_blank', 'noopener,noreferrer');
  };

  if (!isOpen || !isMounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-hidden rounded-[2rem] border border-white/10 bg-black/95 shadow-2xl shadow-black/50">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <X size={24} />
        </button>

        {/* Content */}
        <div className="max-h-[84vh] overflow-y-auto p-6 sm:p-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Quick Policy Highlights
          </h2>
          <p className="text-gray-300 mb-6 text-base sm:text-lg">
            Before you message us on Instagram, please review these key booking policies:
          </p>

          {/* Policy Summary */}
          <div className="space-y-4 mb-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h3 className="text-lg font-semibold text-white mb-2">Deposit</h3>
              <p className="text-gray-300 leading-relaxed">
                A $20 deposit is required to secure your shoot date. Final payment is due on the day of the session.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h3 className="text-lg font-semibold text-white mb-2">Cancellations & Late Policy</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                <li>Deposits are non-refundable.</li>
                <li>Cancel within 24 hours and the booking fee is still due.</li>
                <li>10–30 min late: $20 charge, 30+ min late: $45 charge.</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h3 className="text-lg font-semibold text-white mb-2">Delivery Timeline</h3>
              <p className="text-gray-300 leading-relaxed">
                Final edits are delivered within 3–5 business days, with a review call shortly after your shoot.
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              onClick={handleProceed}
              className="w-full bg-pink-500 hover:bg-pink-600 text-white"
            >
              Continue to Instagram DM
            </Button>
            <Button
              onClick={onClose}
              className="w-full border border-white/10 bg-white/10 text-white hover:bg-white/20"
            >
              Close
            </Button>
          </div>

          <p className="text-xs text-gray-400 text-center mt-4">
            For full details, visit our <a href="/policy" className="underline hover:text-gray-200">policy page</a>.
          </p>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
