import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Save, Eye, EyeOff, Search, FileText, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import { getLocalBlogs, saveLocalBlogs } from '../../data/catalog';
import { useToast } from '../../components/admin/Toast';

const empty = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  coverImage: '',
  author: 'Raftar Footwear',
  tags: '',
  isPublished: true,
};

export default function AdminBlogs() {
  const { toast, confirm } = useToast();
  const [blogs, setBlogs] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [useLocal, setUseLocal] = useState(false);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/blogs?all=true');
      const list = data.data || [];
      if (list.length >= 0) {
        setBlogs(list);
        setUseLocal(false);
      }
    } catch {
      setBlogs(getLocalBlogs());
      setUseLocal(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openNew = () => {
    setForm(empty);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (b) => {
    setForm({
      title: b.title || '',
      slug: b.slug || '',
      excerpt: b.excerpt || '',
      content: b.content || '',
      coverImage: b.coverImage || '',
      author: b.author || 'Raftar Footwear',
      tags: Array.isArray(b.tags) ? b.tags.join(', ') : '',
      isPublished: b.isPublished !== false,
    });
    setEditingId(b._id);
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      slug:
        form.slug ||
        form.title
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, ''),
    };

    if (useLocal) {
      let list = getLocalBlogs();
      if (editingId) {
        list = list.map((b) => (b._id === editingId ? { ...b, ...payload, _id: editingId } : b));
      } else {
        list.unshift({
          ...payload,
          _id: 'local-blog-' + Date.now(),
          publishedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        });
      }
      saveLocalBlogs(list);
      setBlogs(list);
    } else {
      try {
        if (editingId) {
          await api.put(`/blogs/${editingId}`, payload);
        } else {
          await api.post('/blogs', payload);
        }
        await load();
      } catch (err) {
        // fallback to local
        let list = getLocalBlogs();
        if (editingId) {
          list = list.map((b) => (b._id === editingId ? { ...b, ...payload } : b));
        } else {
          list.unshift({ ...payload, _id: 'local-blog-' + Date.now(), publishedAt: new Date().toISOString() });
        }
        saveLocalBlogs(list);
        setBlogs(list);
        setUseLocal(true);
      }
    }
    setShowForm(false);
    setForm(empty);
    setEditingId(null);
    toast(editingId ? 'Blog post updated' : 'Blog post created');
  };

  const handleDelete = async (id) => {
    const ok = await confirm('Delete this blog post?');
    if (!ok) return;
    if (useLocal) {
      const list = getLocalBlogs().filter((b) => b._id !== id);
      saveLocalBlogs(list);
      setBlogs(list);
    } else {
      try {
        await api.delete(`/blogs/${id}`);
        await load();
      } catch {
        const list = blogs.filter((b) => b._id !== id);
        saveLocalBlogs(list);
        setBlogs(list);
        setUseLocal(true);
      }
    }
    toast('Blog post deleted');
  };

  const publishedCount = blogs.filter((b) => b.isPublished !== false).length;
  const draftCount = blogs.length - publishedCount;

  const stats = [
    { label: 'Total Posts', value: blogs.length, icon: FileText, color: 'bg-blue-500' },
    { label: 'Published', value: publishedCount, icon: CheckCircle2, color: 'bg-emerald-500' },
    { label: 'Drafts', value: draftCount, icon: EyeOff, color: 'bg-gray-500' },
  ];

  const filtered = blogs.filter((b) => {
    const q = query.trim().toLowerCase();
    if (q && !(b.title || '').toLowerCase().includes(q) && !(b.excerpt || '').toLowerCase().includes(q)) return false;
    if (statusFilter === 'published' && b.isPublished === false) return false;
    if (statusFilter === 'draft' && b.isPublished !== false) return false;
    return true;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Blog Posts</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage articles shown on the storefront {useLocal && <span className="text-amber-600">(local mode)</span>}
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800"
        >
          <Plus size={16} /> New Post
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {stats.map((c, i) => (
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${c.color} text-white flex items-center justify-center shrink-0`}>
              <c.icon size={19} />
            </div>
            <div>
              <p className="text-[11px] text-gray-500">{c.label}</p>
              <p className="text-lg font-semibold">{c.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative md:col-span-2">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title or excerpt..."
              className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-[#0b4f86]"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0b4f86] bg-white"
          >
            <option value="all">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading…</div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border">
          <p className="text-gray-500 mb-4">No blog posts yet</p>
          <button onClick={openNew} className="text-sm underline">
            Create your first post
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Title</th>
                <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Author</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Status</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b._id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{b.title}</div>
                    <div className="text-xs text-gray-400 mt-0.5 line-clamp-1">{b.excerpt}</div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-gray-600">{b.author}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {b.isPublished !== false ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                        <Eye size={12} /> Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                        <EyeOff size={12} /> Draft
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(b)} className="p-1.5 hover:bg-gray-100 rounded mr-1">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => handleDelete(b._id)} className="p-1.5 hover:bg-rose-50 text-rose-600 rounded">
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">No posts matching your filters</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white">
              <h2 className="text-lg font-semibold">{editingId ? 'Edit Post' : 'New Blog Post'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Title *</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black/10"
                  placeholder="Blog title"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Slug</label>
                <input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black/10"
                  placeholder="auto-generated-from-title"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Cover Image URL</label>
                <input
                  value={form.coverImage}
                  onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black/10"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Excerpt</label>
                <textarea
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  rows={2}
                  className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black/10"
                  placeholder="Short summary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Content *</label>
                <textarea
                  required
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  rows={8}
                  className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black/10 font-mono"
                  placeholder="Full article content (supports plain text / markdown-like)"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Author</label>
                  <input
                    value={form.author}
                    onChange={(e) => setForm({ ...form, author: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black/10"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Tags (comma separated)</label>
                  <input
                    value={form.tags}
                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black/10"
                    placeholder="footwear, tips"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                  className="rounded"
                />
                Published
              </label>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2.5 text-sm border rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800">
                  <Save size={16} /> Save Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
