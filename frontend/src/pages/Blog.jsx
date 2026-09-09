import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { getLocalBlogs } from '../data/catalog';

export default function Blog() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/blogs');
        const list = data.data || [];
        if (list.length) setBlogs(list);
        else setBlogs(getLocalBlogs().filter((b) => b.isPublished !== false));
      } catch {
        setBlogs(getLocalBlogs().filter((b) => b.isPublished !== false));
      }
      setLoading(false);
    })();
  }, []);

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <p className="text-xs tracking-[0.2em] text-gray-500 uppercase mb-2">Insights</p>
        <h1 className="font-display text-3xl sm:text-4xl font-medium">Raftar Blog</h1>
        <p className="text-gray-500 mt-3 max-w-xl mx-auto">
          News, tips and stories from Pakistan’s trusted plastic footwear manufacturer.
        </p>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[16/10] bg-gray-100 rounded-xl mb-4" />
              <div className="h-5 bg-gray-100 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-full" />
            </div>
          ))}
        </div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p>No posts yet. Check back soon.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((b) => (
            <Link
              key={b._id}
              to={`/blog/${b.slug || b._id}`}
              className="group block bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition"
            >
              <div className="aspect-[16/10] bg-gray-50 overflow-hidden">
                {b.coverImage ? (
                  <img
                    src={b.coverImage}
                    alt={b.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">No image</div>
                )}
              </div>
              <div className="p-5">
                <p className="text-xs text-gray-400 mb-2">
                  {b.author} · {b.publishedAt ? new Date(b.publishedAt).toLocaleDateString() : ''}
                </p>
                <h2 className="font-display text-lg font-medium group-hover:text-[#0b4f86] transition line-clamp-2">
                  {b.title}
                </h2>
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">{b.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
