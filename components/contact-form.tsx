'use client';

import { useState, useRef } from 'react';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

const FORMSPREE_FORM_ID = process.env.NEXT_PUBLIC_FORMSPREE_ID || 'xqennkra';
const FORMSPREE_ENDPOINT = `https://formspree.io/f/${FORMSPREE_FORM_ID}`;

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setValidationErrors({});
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

    const errors: Record<string, string> = {};

    // Validation
    if (!name) errors.name = 'Name is required';
    if (name.length > 100) errors.name = 'Name must be less than 100 characters';

    if (!email) errors.email = 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Please enter a valid email address';

    if (!subject) errors.subject = 'Subject is required';
    if (subject.length > 150) errors.subject = 'Subject must be less than 150 characters';

    if (!message) errors.message = 'Message is required';
    if (message.length > 2000) errors.message = 'Message must be less than 2000 characters';

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setIsSubmitting(false);
      return;
    }

    if (!FORMSPREE_ENDPOINT) {
      setError('Contact form is not configured. Please try again later.');
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
        if (formRef.current) {
          formRef.current.reset();
        }
        // Redirect to homepage after 2 seconds
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to send message. Please try again.');
      }
    } catch (err) {
      console.error('Form submission error:', err);
      setError('An error occurred while sending your message. Please try again later.');
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
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
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
                className={`w-full px-4 py-3 border rounded-2xl bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent backdrop-blur-sm transition-colors ${
                  validationErrors.name
                    ? 'border-red-500 focus:ring-red-500/30'
                    : 'border-white/10 focus:ring-white/20'
                }`}
              />
              {validationErrors.name && (
                <p className="text-red-400 text-sm mt-1">{validationErrors.name}</p>
              )}
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
                className={`w-full px-4 py-3 border rounded-2xl bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent backdrop-blur-sm transition-colors ${
                  validationErrors.email
                    ? 'border-red-500 focus:ring-red-500/30'
                    : 'border-white/10 focus:ring-white/20'
                }`}
              />
              {validationErrors.email && (
                <p className="text-red-400 text-sm mt-1">{validationErrors.email}</p>
              )}
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
              className={`w-full px-4 py-3 border rounded-2xl bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent backdrop-blur-sm transition-colors ${
                validationErrors.subject
                  ? 'border-red-500 focus:ring-red-500/30'
                  : 'border-white/10 focus:ring-white/20'
              }`}
            />
            {validationErrors.subject && (
              <p className="text-red-400 text-sm mt-1">{validationErrors.subject}</p>
            )}
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
              className={`w-full px-4 py-3 border rounded-2xl bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent resize-none backdrop-blur-sm transition-colors ${
                validationErrors.message
                  ? 'border-red-500 focus:ring-red-500/30'
                  : 'border-white/10 focus:ring-white/20'
              }`}
            />
            {validationErrors.message && (
              <p className="text-red-400 text-sm mt-1">{validationErrors.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-white/10 border-white/10 text-white hover:bg-white/20"
          >
            <Mail size={20} />
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </Button>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-300 text-center">
              {error}
            </div>
          )}

          {submitted && (
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-2xl text-green-300 text-center">
              ✓ Thank you for your message! Redirecting you home...
            </div>
          )}
        </form>
      </div>
    </div>
  </section>
  );
}
