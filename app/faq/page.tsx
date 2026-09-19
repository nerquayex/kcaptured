import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { FAQAccordion } from '@/components/faq-accordion';
import { faqItems } from '@/lib/faq-data';
import { ContactForm } from '@/components/contact-form';

export const metadata = {
  title: 'FAQ | KCAPTURED DMV Photography',
  description: 'Get answers to common questions about booking KCAPTURED photography services in Jessup, Maryland and the DMV area.',
  keywords: [
    'photography FAQ',
    'DMV photographer questions',
    'Jessup Maryland photography FAQ',
    'KCAPTURED booking questions',
  ],
};

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-black">
      <Header />

      <main>
        {/* FAQ Section */}
        <section
          className="py-16 md:py-24 relative"
          style={{
            backgroundImage: 'url(https://res.cloudinary.com/dla5ebx4j/image/upload/f_auto,q_auto,w_1200/v1789440180/portfolio/studio/tphc5efwb1zmg7ewx5yb.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
          }}
        >
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_40px_120px_-80px_rgba(255,255,255,0.18)] backdrop-blur-xl">
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
          </div>
        </section>

        {/* Contact CTA */}
        {/* <section className="bg-gray-900 py-16 md:py-24">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Still have questions?
            </h2>
            <p className="text-lg text-gray-300 mb-8">
              Don't see what you're looking for? Reach out and we'll be happy to help!
            </p>
          </div>
        </section> */}

        {/* Contact Form */}
        <ContactForm />
      </main>

      <Footer />
    </div>
  );
}
