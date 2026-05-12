import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

export const metadata = {
  title: 'Policy | KCAPTURED',
  description: 'Booking, late policy, and payment information for KCAPTURED photography services.',
  keywords: ['KCAPTURED policy', 'photography booking policy', 'late fee', 'payment policy'],
};

export default function PolicyPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      <main className="py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-10 shadow-2xl shadow-black/20">
            <h1 className="text-4xl font-semibold mb-8">Policy</h1>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-3">Late Policy</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                If a client is unable to attend the session, the deposit is non-refundable. Cancellations made within 24 hours of the scheduled shoot are non-refundable and count as payment for missed time.
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                <li>10-30 minutes late: $20 upcharge</li>
                <li>30+ minutes late: $45 upcharge</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-3">Turnaround Time</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Final edits are delivered within 3-5 business days. Within 48 hours after the shoot, a Zoom or FaceTime call will be held to review the album and select photos for retouching.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-3">Fees & Add-Ons</h2>
              <ul className="space-y-3 text-gray-300">
                <li>
                  <span className="font-medium text-white">Express fee:</span> $30
                </li>
                <li>
                  <span className="font-medium text-white">Lifestyle add-ons:</span> $15
                </li>
                <li>
                  <span className="font-medium text-white">Studio add-ons:</span> $20
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">Payment</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Clients must put down a $20 deposit on the day of booking and pay the final amount on the day of the session.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-300">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                  <p className="text-sm uppercase tracking-[0.25em] text-gray-400 mb-3">Accepted payment methods</p>
                  <ul className="space-y-2">
                    <li>Cash</li>
                    <li>Cash App: <span className="text-white font-medium">$Kenstevens2</span></li>
                    <li>Zelle: <span className="text-white font-medium">kenny.stevens13@hotmail.com</span></li>
                  </ul>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                  <p className="text-sm uppercase tracking-[0.25em] text-gray-400 mb-3">Business Location</p>
                  <p className="text-gray-300">Maryland</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
