import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { blogPosts } from '@/lib/blog-data';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Blog Post | Photography Studio',
  description: 'Read our latest photography blog post.',
};

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />

      <main className="py-12 md:py-16 bg-black">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            Back to Blog
          </Link>

          {/* Post Header */}
          <header className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-block px-3 py-1 bg-gray-900 rounded-full text-xs font-medium text-gray-200">
                {post.category}
              </span>
              <span className="text-sm text-gray-400">{post.readTime} min read</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              {post.title}
            </h1>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between text-gray-400">
              <div>
                <p className="font-medium text-white">By {post.author}</p>
                <p className="text-sm">
                  {new Date(post.publishedDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </header>

          {/* Post Content */}
          <div className="prose prose-lg max-w-none text-gray-300 leading-relaxed dark:prose-invert">
            {post.content.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="mb-6">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Back to Blog Link */}
          <div className="mt-12 pt-8 border-t border-gray-800">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-white font-semibold hover:text-gray-300 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Blog
            </Link>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
