'use client';

import { useState } from 'react';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FORMSPREE_FORM_ID = process.env.NEXT_PUBLIC_FORMSPREE_ID || '';
const FORMSPREE_ENDPOINT = FORMSPREE_FORM_ID
  ? `https://formspree.io/f/${FORMSPREE_FORM_ID}`
  : '';

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const honeypot = formData.get('website')?.toString().trim();

    if (honeypot) {
      setIsSubmitting(false);
      return;
    }

    const name = formData.get('name')?.toString().trim() ?? '';
    const email = formData.get('email')?.toString().trim() ?? '';
    const subject = formData.get('subject')?.toString().trim() ?? '';
    const message = formData.get('message')?.toString().trim() ?? '';

    if (!FORMSPREE_ENDPOINT) {
      console.error('Missing NEXT_PUBLIC_FORMSPREE_ID environment variable.');
      setIsSubmitting(false);
      return;
    }

    if (
      !name ||
      !email ||
      !subject ||
      !message ||
      name.length > 100 ||
      subject.length > 150 ||
      message.length > 2000
    ) {
      console.error('Contact form validation failed.');
      setIsSubmitting(false);
      return;
    }

    const submissionData = new FormData();
    submissionData.append('name', name);
    submissionData.append('email', email);
    submissionData.append('subject', subject);
    submissionData.append('message', message);

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        body: submissionData,
        headers: {
          Accept: 'application/json',
        },
      });

      if (response.ok) {
        setSubmitted(true);
        e.currentTarget.reset();
        setTimeout(() => setSubmitted(false), 5000);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="contact"
      className="relative py-16 md:py-24 bg-black bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_18%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.05),transparent_22%)]"
    >
      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_40px_120px_-80px_rgba(255,255,255,0.22)] backdrop-blur-xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Get In Touch
            </h2>
            <p className="text-xl text-gray-300">
              Have questions? We'd love to hear from you.
            </p>
          </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="sr-only">
            <label htmlFor="website">Website</label>
            <input
              id="website"
              name="website"
              type="text"
              autoComplete="off"
              tabIndex={-1}
              className="pointer-events-none opacity-0 absolute"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-white font-medium mb-2">
                Your Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Eg: John Solos"
                maxLength={100}
                autoComplete="name"
                required
                className="w-full px-4 py-3 border border-white/10 rounded-2xl bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent backdrop-blur-sm"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-white font-medium mb-2">
                Your Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="john@example.com"
                maxLength={254}
                autoComplete="email"
                required
                className="w-full px-4 py-3 border border-white/10 rounded-2xl bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent backdrop-blur-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="subject" className="block text-white font-medium mb-2">
              Subject
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              placeholder="Photography Inquiry"
              maxLength={150}
              required
              className="w-full px-4 py-3 border border-white/10 rounded-2xl bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent backdrop-blur-sm"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-white font-medium mb-2">
              Your Message
            </label>
            <textarea
              id="message"
              name="message"
              placeholder="Tell us about your photography needs..."
              rows={6}
              maxLength={2000}
              required
              className="w-full px-4 py-3 border border-white/10 rounded-2xl bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent resize-none backdrop-blur-sm"
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !FORMSPREE_ENDPOINT}
            className="w-full bg-white/10 border-white/10 text-white hover:bg-white/20"
          >
            <Mail size={20} />
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </Button>

          {/* {!FORMSPREE_ENDPOINT ? (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-center">
              Contact form is disabled until NEXT_PUBLIC_FORMSPREE_ID is configured.
            </div>
          ) : null} */}

          {submitted && (
            <div className="p-4 bg-white/10 border border-white/10 rounded-2xl text-gray-100 text-center">
              Thank you for your message! We'll get back to you soon.
            </div>
          )}
        </form>
      </div>
    </div>
  </section>
  );
}
