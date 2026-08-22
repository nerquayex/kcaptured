import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { MasonryGallery } from "@/components/masonry-gallery";
import { pool } from "@/lib/db";
import type { PortfolioImage } from "@/lib/portfolio-data";

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
  let images: PortfolioImage[] = [];

  try {
    const result = await pool.query(
      "SELECT id, public_id, cloudinary_url, category, title, caption, featured, width, height FROM portfolio_items WHERE active = true ORDER BY sort_order ASC",
    );
    images = result.rows.map((row: any) => ({
      id: row.id,
      publicId: row.public_id,
      cloudinaryUrl: row.cloudinary_url,
      category: row.category,
      title: row.title,
      caption: row.caption ?? undefined,
      featured: row.featured,
      width: row.width ?? 1200,
      height: row.height ?? 800,
    }));
  } catch (error) {
    console.error("[portfolio] failed to load portfolio items", error);
  }

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
