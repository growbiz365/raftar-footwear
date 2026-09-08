import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { getLocalBlogs } from '../data/catalog';

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/blogs/${slug}`);
        if (data.data) setPost(data.data);
        else {
          const local = getLocalBlogs().find((b) => b.slug === slug || b._id === slug);
          setPost(local || null);
        }
      } catch {
        const local = getLocalBlogs().find((b) => b.slug === slug || b._id === slug);
        setPost(local || null);
      }
      setLoading(false);
    })();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="h-8 bg-gray-100 animate-pulse rounded w-3/4 mb-6" />
        <div className="aspect-video bg-gray-100 animate-pulse rounded-xl mb-8" />
        <div className="space-y-3">
          <div className="h-4 bg-gray-100 animate-pulse rounded" />
          <div className="h-4 bg-gray-100 animate-pulse rounded w-5/6" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 mb-4">Post not found</p>
        <Link to="/blog" className="underline text-[#0b4f86]">
          Back to blog
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <Link to="/blog" className="text-sm text-gray-500 hover:text-[#0b4f86] mb-6 inline-block">
        ← All posts
      </Link>
      <p className="text-xs text-gray-400 mb-3">
        {post.author} · {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ''}
      </p>
      <h1 className="font-display text-3xl sm:text-4xl font-medium mb-6 leading-tight">{post.title}</h1>
      {post.coverImage && (
        <div className="aspect-video rounded-2xl overflow-hidden mb-8 bg-gray-50">
          <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}
      {post.excerpt && <p className="text-lg text-gray-600 mb-8 italic border-l-4 border-[#0b4f86] pl-4">{post.excerpt}</p>}
      <div className="prose prose-slate max-w-none whitespace-pre-wrap leading-relaxed text-gray-700">
        {post.content}
      </div>
      {post.tags?.length > 0 && (
        <div className="mt-10 pt-6 border-t flex flex-wrap gap-2">
          {post.tags.map((t) => (
            <span key={t} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
              {t}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
