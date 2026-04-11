import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

export const metadata = {
  title: 'About KCAPTURED | DMV Photographer in Jessup, Maryland',
  description: 'Meet KCAPTURED, a DMV-focused photography studio in Jessup, Maryland offering lifestyle, portrait, and studio sessions at affordable rates.',
  keywords: [
    'About KCAPTURED',
    'DMV photographer',
    'Jessup Maryland photography',
    'portrait studio',
    'Kcaptured Studios',
    'KCAPTURED photographer',
  ],
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      <main className="relative overflow-hidden py-16 md:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(139,92,246,0.25),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.16),_transparent_30%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] items-start gap-12">
            <div className="order-first max-w-2xl">
              <p className="text-sm uppercase tracking-[0.5em] text-gray-400 mb-6">KCAPTURED</p>
              <h1 className="text-5xl md:text-6xl font-semibold uppercase tracking-[0.18em] text-white mb-8">
                BIOGRAPHY
              </h1>
              <p className="text-base leading-relaxed text-gray-300 mb-6">
                Welcome to Kcaptures Productions! As an athlete with a passion for art, I picked up a camera to capture the thrilling moments of basketball, even though it wasn't my strongest sport.
              </p>
              <p className="text-base leading-relaxed text-gray-300 mb-6">
                What started as a hobby has blossomed into a love for helping others express their innermost art and feelings through photography. At the end of the day, I'm just a guy with a ready eye to showcase the beauty of every moment.
              </p>
              <p className="text-base leading-relaxed text-gray-400">
                I specialize in cinematic portraits and bold lifestyle sessions that bring confidence, movement, and emotion into every frame. Let’s create something unforgettable.
              </p>
            </div>

            <div className="order-last relative overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl shadow-black/40">
              <img
                src="https://res.cloudinary.com/dq4tkpuu4/image/upload/v1773807338/32-1Z7A1257__2_shyxak.jpg"
                alt="About KCAPTURED Productions"
                className="h-[520px] w-full object-cover object-center"
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
