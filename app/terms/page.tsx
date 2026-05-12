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
              <p className="text-gray-300 leading-relaxed mb-3">
                Service details, pricing, and booking are subject to availability and confirmation. To book a session, a $20 deposit is required to hold your date. The final payment is due on the day of your session.
              </p>
              <p className="text-gray-300 leading-relaxed">
                Payment is accepted via cash, Cash App ($Kenstevens2), or Zelle (kenny.stevens13@hotmail.com). Any agreements made through the site or Instagram are between you and KCAPTURED Productions.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-2xl font-semibold mb-3">Cancellation and Late Policy</h2>
              <p className="text-gray-300 leading-relaxed mb-3">
                If you are unable to attend your session, deposits are non-refundable. Cancellations within 24 hours of the shoot are non-refundable and count as payment for missed time.
              </p>
              <p className="text-gray-300 leading-relaxed mb-3">
                Late arrivals are subject to fees: 10-30 minutes late incurs a $20 upcharge, and 30+ minutes late incurs a $45 upcharge.
              </p>
              <p className="text-gray-300 leading-relaxed">
                Final edited photos are delivered within 3-5 business days. Within 48 hours after your shoot, a Zoom or FaceTime call will be held to review your album and select photos for retouching.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-2xl font-semibold mb-3">Add-Ons and Fees</h2>
              <p className="text-gray-300 leading-relaxed">
                Optional add-ons are available: express fees ($30 for expedited turnaround), lifestyle add-ons ($15), and studio add-ons ($20).
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
