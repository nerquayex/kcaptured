import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { MasonryGallery } from "@/components/masonry-gallery";
import { pool } from "@/lib/db";

export const metadata = {
  title: "Portfolio | KCAPTURED DMV Photography",
  description:
    "Explore the KCAPTURED portfolio with lifestyle, studio, portrait, and athletic photography from Jessup, Maryland and the DMV.",
  keywords: [
    "KCAPTURED portfolio",
    "DMV photography portfolio",
    "Jessup Maryland portraits",
    "studio photography examples",
    "lifestyle portrait photography",
  ],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

// Always fetch fresh data - don't cache uploads
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function PortfolioPage() {
  // Fetch portfolio items from database in their configured sort order
  const portfolioRes = await pool.query('SELECT * FROM portfolio_items WHERE active = true ORDER BY sort_order ASC');
  const images = (portfolioRes?.rows ?? []).map((r: any) => ({
    id: r.id,
    cloudinaryUrl: r.cloudinary_url,
    publicId: r.public_id,
    category: r.category,
    title: r.title,
    description: r.caption ?? undefined,
    width: r.width ?? 1200,
    height: r.height ?? 800,
  }));

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      <main className="py-16 md:py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-xl text-gray-300">A selection of our recent work</p>
            <h1 className="mt-4 text-4xl font-semibold text-white">Portfolio</h1>
          </div>

          <MasonryGallery images={images} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
