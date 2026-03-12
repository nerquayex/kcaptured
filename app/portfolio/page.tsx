import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MasonryGallery } from '@/components/masonry-gallery';

export const metadata = {
  title: 'Portfolio | Photography Studio',
  description: 'View our collection of lifestyle and studio photography work.',
};

export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-black">
      <Header />

      <main className="py-16 md:py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              Portfolio
            </h1>
            <p className="text-xl text-gray-300">
              A selection of our recent work
            </p>
          </div>

          {/* Gallery */}
          <MasonryGallery />
        </div>
      </main>

      <Footer />
    </div>
  );
}
