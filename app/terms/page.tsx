import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

export const metadata = {
  title: 'Terms of Service | KCAPTURED',
  description: 'Terms of service for KCAPTURED photography services in Jessup, Maryland and the DMV.',
  keywords: ['KCAPTURED terms', 'DMV photography terms', 'Jessup MD terms of service'],
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      <main className="py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-10 shadow-2xl shadow-black/20">
            <h1 className="text-4xl font-semibold mb-6">Terms of Service</h1>
            <p className="text-gray-300 mb-6">
              These terms govern your use of the KCAPTURED Productions website and services. By using this site, you agree to these terms.
            </p>

            <section className="mb-6">
              <h2 className="text-2xl font-semibold mb-3">Use of the Site</h2>
              <p className="text-gray-300 leading-relaxed">
                You may use the site for personal and professional inquiries only. Unauthorized use or reproduction of content is prohibited.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-2xl font-semibold mb-3">Booking and Services</h2>
              <p className="text-gray-300 leading-relaxed">
                Service details, pricing, and booking are subject to availability and confirmation. Any agreements made through the site are between you and KCAPTURED Productions.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-2xl font-semibold mb-3">Intellectual Property</h2>
              <p className="text-gray-300 leading-relaxed">
                All images, text, and design elements on this site are the property of KCAPTURED Productions unless otherwise noted. You may not use them without permission.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-2xl font-semibold mb-3">Disclaimer</h2>
              <p className="text-gray-300 leading-relaxed">
                The site is provided "as is" without warranties of any kind. KCAPTURED Productions is not liable for any damages arising from your use of the site.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">Changes</h2>
              <p className="text-gray-300 leading-relaxed">
                We may update these terms from time to time. Continued use of the site after changes means you accept the updated terms.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
