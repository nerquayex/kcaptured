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
    <section id="contact" className="py-16 md:py-24 bg-white dark:bg-black">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-black dark:text-white mb-4">
            Get In Touch
          </h2>
          <p className="text-xl text-gray-700 dark:text-gray-300">
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
              <label htmlFor="name" className="block text-black dark:text-white font-medium mb-2">
                Your Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="John Doe"
                maxLength={100}
                autoComplete="name"
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-black dark:text-white font-medium mb-2">
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
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label htmlFor="subject" className="block text-black dark:text-white font-medium mb-2">
              Subject
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              placeholder="Photography Inquiry"
              maxLength={150}
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-black dark:text-white font-medium mb-2">
              Your Message
            </label>
            <textarea
              id="message"
              name="message"
              placeholder="Tell us about your photography needs..."
              rows={6}
              maxLength={2000}
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent resize-none"
            />
          </div>

          <Button type="submit" disabled={isSubmitting || !FORMSPREE_ENDPOINT} className="w-full">
            <Mail size={20} />
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </Button>

          {!FORMSPREE_ENDPOINT ? (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-center">
              Contact form is disabled until NEXT_PUBLIC_FORMSPREE_ID is configured.
            </div>
          ) : null}

          {submitted && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-center">
              Thank you for your message! We'll get back to you soon.
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
