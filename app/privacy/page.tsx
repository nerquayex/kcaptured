import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

export const metadata = {
  title: 'Privacy Policy | KCAPTURED',
  description: 'Privacy policy for KCAPTURED photography services and the DMV website.',
  keywords: ['KCAPTURED privacy', 'DMV photography privacy', 'Jessup MD privacy policy'],
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      <main className="py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-10 shadow-2xl shadow-black/20">
            <h1 className="text-4xl font-semibold mb-6">Privacy Policy</h1>
            <p className="text-gray-300 mb-6">
              KCAPTURED Productions is committed to protecting your privacy. This policy explains what information we collect, how we use it, and the choices you have.
            </p>

            <section className="mb-6">
              <h2 className="text-2xl font-semibold mb-3">Information We Collect</h2>
              <p className="text-gray-300 leading-relaxed">
                We may collect the information you provide directly, such as contact details when you send an inquiry. We also use standard analytics tools to understand site usage and improve performance.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-2xl font-semibold mb-3">How We Use Information</h2>
              <p className="text-gray-300 leading-relaxed">
                Information is used to respond to inquiries, manage bookings, and improve the website experience. We do not sell or share personal information with third parties for marketing purposes.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-2xl font-semibold mb-3">Cookies and Tracking</h2>
              <p className="text-gray-300 leading-relaxed">
                The site may use cookies or similar tracking tools to remember preferences and analyze traffic. You can control cookies through your browser settings.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-2xl font-semibold mb-3">Security</h2>
              <p className="text-gray-300 leading-relaxed">
                We take reasonable measures to protect your information, but no system is completely secure. Please contact us if you have any security concerns.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">Contact</h2>
              <p className="text-gray-300 leading-relaxed">
                If you have questions about this policy, please reach out via email or the contact form on the site.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
