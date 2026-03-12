import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { BlogPostCard } from '@/components/blog-post-card';
import { blogPosts } from '@/lib/blog-data';

export const metadata = {
  title: 'Blog | Photography Studio',
  description: 'Photography tips, techniques, and studio insights.',
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-black">
      <Header />

      <main className="py-16 md:py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              Blog
            </h1>
            <p className="text-xl text-gray-300">
              Photography tips, techniques, and studio insights
            </p>
          </div>

          {/* Blog Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.map((post) => (
              <BlogPostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
