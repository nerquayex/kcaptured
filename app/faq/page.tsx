import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { FAQAccordion } from '@/components/faq-accordion';
import { faqItems } from '@/lib/faq-data';
import { ContactForm } from '@/components/contact-form';

export const metadata = {
  title: 'FAQ | Photography Studio',
  description: 'Frequently asked questions about our photography services.',
};

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-black">
      <Header />

      <main>
        {/* FAQ Section */}
        <section className="py-16 md:py-24 bg-black">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Page Header */}
            <div className="text-center mb-16">
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
                Frequently Asked Questions
              </h1>
              <p className="text-xl text-gray-300">
                Find answers to common questions about our services
              </p>
            </div>

            {/* Accordion */}
            <FAQAccordion items={faqItems} />
          </div>
        </section>

        {/* Contact CTA */}
        <section className="bg-gray-900 py-16 md:py-24">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Still have questions?
            </h2>
            <p className="text-lg text-gray-300 mb-8">
              Don't see what you're looking for? Reach out and we'll be happy to help!
            </p>
          </div>
        </section>

        {/* Contact Form */}
        <ContactForm />
      </main>

      <Footer />
    </div>
  );
}
