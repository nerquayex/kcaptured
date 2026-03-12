import Link from 'next/link';
import { BlogPost } from '@/lib/blog-data';
import { ArrowRight } from 'lucide-react';

export function BlogPostCard({ post }: { post: BlogPost }) {
  return (
    <article className="flex flex-col h-full border border-gray-800 rounded-lg p-6 bg-gray-950 hover:shadow-lg dark:hover:shadow-black transition-shadow">
      {/* Meta Info */}
      <div className="flex items-center justify-between mb-4 text-sm text-gray-400">
        <span className="inline-block px-3 py-1 bg-gray-900 rounded-full text-xs font-medium text-gray-200">
          {post.category}
        </span>
        <span>{post.readTime} min read</span>
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-white mb-3 leading-tight">
        {post.title}
      </h3>

      {/* Excerpt */}
      <p className="text-gray-400 mb-4 flex-grow">
        {post.excerpt}
      </p>

      {/* Date */}
      <p className="text-sm text-gray-500 mb-4">
        {new Date(post.publishedDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </p>

      {/* Read More Link */}
      <Link
        href={`/blog/${post.slug}`}
        className="inline-flex items-center gap-2 text-white font-semibold group hover:text-gray-300 transition-colors"
      >
        Read Article
        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
      </Link>
    </article>
  );
}
