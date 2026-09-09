import { useEffect, useState, useRef } from 'react';
import api from '../../services/api';
import { Plus, Trash2, X, Pencil, Upload, Loader2, Image as ImageIcon, Search, Package, TrendingUp, AlertTriangle, Star, Layers } from 'lucide-react';
import { getLocalProducts, saveLocalProducts, getMergedProducts } from '../../data/catalog';
import { useToast } from '../../components/admin/Toast';

const emptyForm = {
  name: '',
  price: '',
  compareAtPrice: '',
  category: 'Men',
  brand: 'raftar',
  stock: 100,
  description: '',
  sizes: '7/10',
  tags: 'Footwear,Wholesale',
  article: '',
  featured: false,
  isWholesale: true,
};

const hexName = (hex) => {
  const map = {
    '#000000': 'Black', '#111111': 'Black', '#333333': 'Dark Gray', '#555555': 'Gray', '#888888': 'Gray',
    '#999999': 'Gray', '#d1d5db': 'Light Gray', '#ffffff': 'White', '#fef3c7': 'Beige', '#f5f5dc': 'Beige',
    '#8b5a2b': 'Brown', '#6b4226': 'Brown', '#794044': 'Brown', '#a0522d': 'Brown', '#cd853f': 'Tan',
    '#ff0000': 'Red', '#dc2626': 'Red', '#ef4444': 'Red', '#f97316': 'Orange', '#ff8000': 'Orange',
    '#f59e0b': 'Amber', '#ffbf00': 'Yellow', '#facc15': 'Yellow', '#22c55e': 'Green', '#15803d': 'Green',
    '#008000': 'Green', '#0ea5e9': 'Sky Blue', '#0071e3': 'Blue', '#0000ff': 'Blue', '#2563eb': 'Blue',
    '#3b82f6': 'Blue', '#1e3a8a': 'Navy', '#000080': 'Navy', '#8b00ff': 'Purple', '#a855f7': 'Purple',
    '#9333ea': 'Purple', '#ec4899': 'Pink', '#ffc0cb': 'Pink', '#e11d48': 'Rose', '#b76e79': 'Rose',
    '#808000': 'Olive', '#40e0d0': 'Turquoise', '#008080': 'Teal', '#00ffff': 'Cyan', '#ffd700': 'Gold',
    '#c0c0c0': 'Silver', '#a52a2a': 'Maroon', '#4b5563': 'Gray',
  };
  return map[String(hex).toLowerCase()] || '';
};

export default function AdminProducts() {
  const { toast, confirm } = useToast();
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [photos, setPhotos] = useState([{ url: '', color: '#ffffff', single: true }]);
  const [photoMode, setPhotoMode] = useState(null);
  const [singleFile, setSingleFile] = useState(null);
  const [singleUrl, setSingleUrl] = useState('');
  const [singleColor, setSingleColor] = useState('#0071e3');
  const [singleName, setSingleName] = useState('');
  const [singleUploading, setSingleUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [useLocal, setUseLocal] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [query, setQuery] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  const [featuredFilter, setFeaturedFilter] = useState(false);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 8;
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ done: 0, total: 0 });
  const [urlDraft, setUrlDraft] = useState('');
  const photoInputRef = useRef(null);
  const [selected, setSelected] = useState(new Set());

  const uploadImageFile = async (file) => {
    const fd = new FormData();
    fd.append('image', file);
    try {
      const { data } = await api.post('/admin/upload-image', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const url = data?.data?.url || data?.url;
      if (url) return url;
    } catch {
      /* fall through to base64 */
    }
    return await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  };

  const handleAddPhotos = async (e) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;
    setError('');
    setUploadProgress({ done: 0, total: selected.length });
    setUploadingFiles(true);
    try {
      const urls = [];
      for (const f of selected) {
        urls.push(await uploadImageFile(f));
        setUploadProgress((p) => ({ ...p, done: p.done + 1 }));
      }
      setPhotos((arr) => {
        const base = arr.length === 1 && !arr[0].url ? [] : arr.slice();
        return [...base, ...urls.filter(Boolean).map((url) => ({ url, color: '', single: false }))];
      });
    } catch (e2) {
      setError(e2.message || 'One or more images failed to upload');
    } finally {
      setUploadingFiles(false);
      setUploadProgress({ done: 0, total: 0 });
      e.target.value = '';
    }
  };

  const loadCategoryOptions = async () => {
    try {
      const { data } = await api.get('/admin/categories');
      const list = (data.data || []).map((c) => c.name).filter(Boolean);
      setCategories(list.length ? list : ['Men', 'Women', 'Children', 'Slides', 'Chappals', 'Sports']);
    } catch {
      setCategories(['Men', 'Women', 'Children', 'Slides', 'Chappals', 'Sports']);
    }
  };

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/products');
      const list = data.data || [];
      setProducts(list);
      setUseLocal(false);
    } catch {
      setProducts(getLocalProducts().length ? getLocalProducts() : getMergedProducts());
      setUseLocal(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    loadCategoryOptions();
  }, []);

  const openNew = () => {
    setEditId(null);
    setForm(emptyForm);
    setPhotos([{ url: '', color: '#ffffff', colorName: '', single: true }]);
    setError('');
    setShowForm(true);
  };

  const openEdit = (p) => {
    setEditId(p._id);
    setForm({
      name: p.name || '',
      price: p.price ?? '',
      compareAtPrice: p.compareAtPrice ?? '',
      category: p.category || 'Men',
      brand: p.brand || 'raftar',
      stock: p.stock ?? 100,
      description: p.description || '',
      sizes: (p.sizes || []).join(', '),
      tags: (p.tags || []).join(', '),
      article: p.article || '',
      featured: !!p.featured,
      isWholesale: p.isWholesale !== false,
    });
    const colorMap = {};
    const nameMap = {};
    (p.colorVariants || []).forEach((v) => {
      if (v.image && v.hex) colorMap[v.image] = v.hex;
      if (v.image && v.name) nameMap[v.image] = v.name;
    });
    const saved = (p.images || []).filter(Boolean);
    setPhotos(saved.length
      ? saved.map((url) => ({
          url,
          color: colorMap[url] || '',
          colorName: nameMap[url] || '',
          single: !!colorMap[url],
        }))
      : [{ url: '', color: '#ffffff', colorName: '', single: true }]);
    setError('');
    setShowForm(true);
  };

const removePhoto = (i) => setPhotos((arr) => arr.filter((_, idx) => idx !== i));

  const makePhotoMain = (url) =>
    setPhotos((arr) => {
      const target = arr.find((p) => p.url === url);
      const rest = arr.filter((p) => p.url && p.url !== url);
      return target ? [target, ...rest] : arr;
    });

  const appendPhoto = (u) => {
    const t = (u || '').trim();
    if (!t) return;
    setPhotos((arr) => (arr.length === 1 && !arr[0].url ? [{ url: t, color: '', single: false }] : [...arr, { url: t, color: '', single: false }]));
  };

  const setPhotoColor = (i, color) =>
    setPhotos((arr) => arr.map((p, idx) => (idx === i ? { ...p, color, single: true } : p)));

  const setPhotoColorName = (i, name) =>
    setPhotos((arr) => arr.map((p, idx) => (idx === i ? { ...p, colorName: name } : p)));

  const applySingleAdd = async () => {
    let url = singleUrl.trim();
    if (!url && singleFile) {
      setSingleUploading(true);
      url = await uploadImageFile(singleFile);
      setSingleUploading(false);
    }
    if (!url) {
      setError('Choose a file or paste an image URL for the single photo.');
      return;
    }
    setPhotos((arr) => {
      const base = arr.length === 1 && !arr[0].url ? [] : arr.slice();
      return [...base, { url, color: singleColor, colorName: singleName, single: true }];
    });
    setSingleFile(null);
    setSingleUrl('');
    setSingleName('');
    setError('');
    toast('Photo added — keep adding more, or select Option 2 for bulk upload.', 'success');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const photoVariants = photos
      .filter((p) => p.url.trim() && p.single && p.color)
      .map((p) => ({ name: (p.colorName || hexName(p.color)).trim(), hex: p.color, image: p.url.trim() }));
    const cleanImages = photos.map((p) => p.url.trim()).filter(Boolean);

    const payload = {
      name: form.name.trim(),
      price: parseFloat(form.price) || 0,
      compareAtPrice: form.compareAtPrice ? parseFloat(form.compareAtPrice) : null,
      category: form.category,
      brand: form.brand,
      stock: parseInt(form.stock) || 0,
      description: form.description,
      sizes: form.sizes.split(',').map((s) => s.trim()).filter(Boolean),
      tags: form.tags.split(',').map((s) => s.trim()).filter(Boolean),
      colors: photoVariants.map((v) => v.name).filter(Boolean),
      colorVariants: photoVariants,
      images: cleanImages,
      article: form.article,
      featured: form.featured,
      isWholesale: form.isWholesale,
      packPrices: {
        1: parseFloat(form.price) || 0,
        6: Math.round((parseFloat(form.price) || 0) * 6 * 0.95),
        12: Math.round((parseFloat(form.price) || 0) * 12 * 0.9),
      },
    };

    try {
      if (useLocal) {
        let list = getLocalProducts();
        if (editId) {
          list = list.map((p) => (p._id === editId ? { ...p, ...payload, _id: editId, slug: p.slug } : p));
        } else {
          const slug = payload.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
          list.unshift({ ...payload, _id: 'local-' + Date.now(), slug, isActive: true });
        }
        saveLocalProducts(list);
        setProducts(getMergedProducts());
      } else {
        const fd = new FormData();
        Object.entries(payload).forEach(([k, v]) => {
          if (k === 'colorVariants' || k === 'packPrices' || k === 'images' || k === 'colors' || k === 'sizes' || k === 'tags') {
            fd.append(k, typeof v === 'string' ? v : JSON.stringify(v));
          } else if (typeof v === 'boolean') {
            fd.append(k, v ? 'true' : 'false');
          } else if (v != null) {
            fd.append(k, v);
          }
        });
        // Also send comma strings for backend parseBody compatibility
        fd.set('colors', payload.colors.join(','));
        fd.set('sizes', payload.sizes.join(','));
        fd.set('tags', payload.tags.join(','));
        fd.set('images', payload.images.join(','));

        if (editId) {
          await api.put(`/admin/products/${editId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        } else {
          await api.post('/admin/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        }
        await load();
      }
      setShowForm(false);
      toast(editId ? 'Product updated' : 'Product created');
    } catch (err) {
      // fallback local
      try {
        let list = getLocalProducts();
        const slug = payload.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        if (editId) {
          list = list.map((p) => (p._id === editId ? { ...p, ...payload } : p));
        } else {
          list.unshift({ ...payload, _id: 'local-' + Date.now(), slug, isActive: true });
        }
        saveLocalProducts(list);
        setProducts(getMergedProducts());
        setUseLocal(true);
        setShowForm(false);
        toast(editId ? 'Product updated (local mode)' : 'Product created (local mode)');
      } catch (e2) {
        setError(err.response?.data?.message || err.message || 'Save failed');
        toast('Failed to save product', 'error');
      }
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    const name = products.find((p) => p._id === id)?.name || 'product';
    const ok = await confirm(`Delete "${name}"? This cannot be undone.`);
    if (!ok) return;
    try {
      if (useLocal) {
        const list = getLocalProducts().filter((p) => p._id !== id);
        const remaining = getMergedProducts().filter((p) => p._id !== id);
        const deleted = JSON.parse(localStorage.getItem('raftar_deleted_products') || '[]');
        if (String(id).startsWith('static-')) {
          deleted.push(id);
          localStorage.setItem('raftar_deleted_products', JSON.stringify(deleted));
        }
        setProducts(remaining.filter((p) => !deleted.includes(p._id)));
      } else {
        await api.delete(`/admin/products/${id}`);
        await load();
      }
      toast('Product deleted');
    } catch {
      setProducts((prev) => prev.filter((p) => p._id !== id));
      toast('Product deleted');
    }
    setSelected((prev) => { const next = new Set(prev); next.delete(id); return next; });
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    const ok = await confirm(`Delete ${selected.size} selected product(s)? This cannot be undone.`);
    if (!ok) return;
    const ids = [...selected];
    if (useLocal) {
      let remaining = getMergedProducts().filter((p) => !ids.includes(p._id));
      const deleted = JSON.parse(localStorage.getItem('raftar_deleted_products') || '[]');
      const newDeleted = [...new Set([...deleted, ...ids.filter((id) => String(id).startsWith('static-'))])];
      localStorage.setItem('raftar_deleted_products', JSON.stringify(newDeleted));
      setProducts(remaining.filter((p) => !newDeleted.includes(p._id)));
      toast(`${ids.length} product(s) deleted`);
    } else {
      try {
        await Promise.all(ids.map((id) => api.delete(`/admin/products/${id}`)));
        await load();
        toast(`${ids.length} product(s) deleted`);
      } catch {
        setProducts((prev) => prev.filter((p) => !ids.includes(p._id)));
        toast(`${ids.length} product(s) deleted`);
      }
    }
    setSelected(new Set());
  };

  const filteredProducts = products.filter((p) => {
    const qq = query.trim().toLowerCase();
    if (
      qq &&
      !(p.name || '').toLowerCase().includes(qq) &&
      !(p.article || '').toLowerCase().includes(qq) &&
      !(p.category || '').toLowerCase().includes(qq) &&
      !(p.brand || '').toLowerCase().includes(qq)
    )
      return false;
    if (catFilter && p.category !== catFilter) return false;
    if (brandFilter && (p.brand || 'raftar') !== brandFilter) return false;
    if (stockFilter === 'in' && (p.stock || 0) <= 0) return false;
    if (stockFilter === 'low' && !((p.stock || 0) > 0 && (p.stock || 0) <= 15)) return false;
    if (stockFilter === 'out' && (p.stock || 0) > 0) return false;
    if (featuredFilter && !p.featured) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageProducts = filteredProducts.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  const updateStock = async (id, stock) => {
    const n = parseInt(stock);
    if (useLocal) {
      const list = getLocalProducts();
      const updated = list.map((p) => (p._id === id ? { ...p, stock: n } : p));
      if (!list.find((p) => p._id === id)) {
        const base = getMergedProducts().find((p) => p._id === id);
        if (base) updated.push({ ...base, stock: n });
      }
      saveLocalProducts(updated);
      setProducts(getMergedProducts());
    } else {
      await api.patch(`/admin/products/${id}/stock`, { stock: n });
      load();
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Products</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage catalog · colors · images · stock · pricing
            {useLocal && <span className="text-amber-600"> (local mode)</span>}
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {[
          { label: 'Total Products', value: products.length, icon: Package, color: 'bg-blue-500' },
          {
            label: 'Total Stock Units',
            value: products.reduce((s, p) => s + (p.stock || 0), 0).toLocaleString(),
            icon: Layers,
            color: 'bg-emerald-500',
          },
          {
            label: 'Low Stock (≤15)',
            value: products.filter((p) => (p.stock || 0) <= 15 && (p.stock || 0) > 0).length,
            icon: AlertTriangle,
            color: 'bg-amber-500',
          },
          {
            label: 'Out of Stock',
            value: products.filter((p) => (p.stock || 0) <= 0).length,
            icon: Package,
            color: 'bg-rose-500',
          },
          {
            label: 'Featured',
            value: products.filter((p) => p.featured).length,
            icon: Star,
            color: 'bg-indigo-500',
          },
          {
            label: 'Inventory Value',
            value: `Rs ${products.reduce((s, p) => s + (p.price || 0) * (p.stock || 0), 0).toLocaleString()}`,
            icon: TrendingUp,
            color: 'bg-slate-700',
          },
        ].map((c, i) => (
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${c.color} text-white flex items-center justify-center shrink-0`}>
              <c.icon size={19} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-gray-500 truncate">{c.label}</p>
              <p className="text-lg font-semibold truncate">{c.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-3">
          <div className="relative xl:col-span-2">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(0); }}
              placeholder="Search name, article, category..."
              className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-[#0b4f86]"
            />
          </div>
          <select
            value={catFilter}
            onChange={(e) => { setCatFilter(e.target.value); setPage(0); }}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0b4f86] bg-white"
          >
            <option value="">All categories</option>
            {[...new Set(products.map((p) => p.category).filter(Boolean))].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={brandFilter}
            onChange={(e) => { setBrandFilter(e.target.value); setPage(0); }}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0b4f86] bg-white"
          >
            <option value="">All brands</option>
            {[...new Set(products.map((p) => p.brand || 'raftar'))].map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
          <select
            value={stockFilter}
            onChange={(e) => { setStockFilter(e.target.value); setPage(0); }}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0b4f86] bg-white"
          >
            <option value="all">All stock</option>
            <option value="in">In stock</option>
            <option value="low">Low stock (≤15)</option>
            <option value="out">Out of stock</option>
          </select>
          <select
            value={featuredFilter ? 'featured' : 'all'}
            onChange={(e) => { setFeaturedFilter(e.target.value === 'featured'); setPage(0); }}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0b4f86] bg-white"
          >
            <option value="all">Featured + regular</option>
            <option value="featured">Featured only</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-gray-200 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border">
          <p className="text-gray-500 mb-4">
            {products.length === 0 ? 'No products yet' : 'No products match your filters'}
          </p>
          {products.length === 0 ? (
            <button onClick={openNew} className="text-sm underline">Add your first product</button>
          ) : (
            <button onClick={() => { setQuery(''); setCatFilter(''); setBrandFilter(''); setStockFilter('all'); setFeaturedFilter(false); }} className="text-sm underline">
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          {selected.size > 0 && (
            <div className="flex items-center justify-between bg-rose-50 border border-rose-100 rounded-xl px-4 py-2.5 mb-3">
              <p className="text-sm text-rose-700 font-medium">{selected.size} selected</p>
              <div className="flex items-center gap-2">
                <button onClick={() => setSelected(new Set())} className="px-3 py-1.5 text-sm text-gray-600 border rounded-lg bg-white hover:bg-gray-50">
                  Clear
                </button>
                <button onClick={handleBulkDelete} className="px-3 py-1.5 text-sm text-white bg-rose-600 rounded-lg hover:bg-rose-700">
                  Delete selected
                </button>
              </div>
            </div>
          )}
          <div className="bg-white rounded-xl border overflow-x-auto shadow-sm">
            <table className="w-full text-sm min-w-[860px]">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 w-8">
                    <input
                      type="checkbox"
                      checked={pageProducts.length > 0 && pageProducts.every((p) => selected.has(p._id))}
                      onChange={(e) => {
                        setSelected((prev) => {
                          const next = new Set(prev);
                          if (e.target.checked) pageProducts.forEach((p) => next.add(p._id));
                          else pageProducts.forEach((p) => next.delete(p._id));
                          return next;
                        });
                      }}
                      className="accent-[#0b4f86]"
                      title="Select all on this page"
                    />
                  </th>
                  <th className="text-left px-4 py-3 font-medium">Product</th>
                  <th className="text-left px-4 py-3 font-medium">Category</th>
                  <th className="text-left px-4 py-3 font-medium">Colors</th>
                  <th className="text-left px-4 py-3 font-medium">Price</th>
                  <th className="text-left px-4 py-3 font-medium">Stock</th>
                  <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Status</th>
                  <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Tags</th>
                  <th className="text-right px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageProducts.map((p) => {
                  const stock = p.stock || 0;
                  const status =
                    stock <= 0
                      ? { label: 'Out of stock', cls: 'bg-rose-100 text-rose-700' }
                      : stock <= 15
                        ? { label: 'Low stock', cls: 'bg-amber-100 text-amber-700' }
                        : { label: 'In stock', cls: 'bg-emerald-100 text-emerald-700' };
                  const colorNames = (p.colorVariants || p.colors || []).map((c) => (typeof c === 'string' ? c : c.name));
                  return (
                    <tr key={p._id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3 w-8">
                        <input
                          type="checkbox"
                          checked={selected.has(p._id)}
                          onChange={(e) => {
                            setSelected((prev) => {
                              const next = new Set(prev);
                              if (e.target.checked) next.add(p._id);
                              else next.delete(p._id);
                              return next;
                            });
                          }}
                          className="accent-[#0b4f86]"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.images?.[0] || p.colorVariants?.[0]?.image || p.image}
                            alt=""
                            className="w-12 h-14 object-cover rounded bg-gray-100 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="font-medium flex items-center gap-1.5">
                              <span className="truncate">{p.name}</span>
                              {p.featured && <Star size={13} className="text-amber-400 fill-amber-400 shrink-0" title="Featured" />}
                            </div>
                            <div className="text-xs text-gray-400">
                              {p.article ? `Article ${p.article}` : ''}
                              {p.article && p.slug ? ' · ' : ''}
                              <span className="capitalize">{p.brand || 'raftar'}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">{p.category || '—'}</span>
                      </td>
                      <td className="px-4 py-3">
                        {colorNames.length ? (
                          <div className="flex items-center gap-1.5">
                            {(p.colorVariants || []).map((v, i) => (
                              <span key={i} title={v.name} className="w-3.5 h-3.5 rounded-full border border-gray-200 inline-block" style={{ backgroundColor: v.hex || '#888' }} />
                            ))}
                            <span className="text-xs text-gray-500">{colorNames.length} color{colorNames.length > 1 ? 's' : ''}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium">Rs {Number(p.price).toLocaleString()}</p>
                        {p.compareAtPrice && (
                          <p className="text-xs text-gray-400 line-through">Rs {Number(p.compareAtPrice).toLocaleString()}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          defaultValue={stock}
                          onBlur={(e) => updateStock(p._id, e.target.value)}
                          className="w-20 border rounded px-2 py-1 text-sm"
                        />
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className={`text-[11px] font-semibold px-2 py-1 rounded-full ${status.cls}`}>{status.label}</span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1 max-w-[150px]">
                          {(p.tags || []).slice(0, 3).map((t) => (
                            <span key={t} className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">{t}</span>
                          ))}
                          {(p.tags || []).length > 3 && <span className="text-[10px] text-gray-400">+{(p.tags || []).length - 3}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button onClick={() => openEdit(p)} className="p-1.5 hover:bg-gray-100 rounded mr-1" title="Edit">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => handleDelete(p._id)} className="p-1.5 hover:bg-rose-50 text-rose-600 rounded" title="Delete">
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredProducts.length > PAGE_SIZE && (
            <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
              <p className="text-xs text-gray-500">
                Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filteredProducts.length)} of {filteredProducts.length} products
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-40"
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`w-8 h-8 text-sm rounded-lg border ${i === page ? 'bg-[#0b4f86] text-white border-[#0b4f86]' : 'hover:bg-gray-50'}`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {showForm && (
  <div className="fixed inset-0 z-50 bg-black/60 overflow-y-auto">
    <div className="min-h-full flex items-end sm:items-center justify-center">
      <div className="w-full max-w-7xl sm:my-6 rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl flex flex-col max-h-[96vh] sm:max-h-[92vh] overflow-hidden">
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b bg-white shrink-0">
          <div>
            <h2 className="text-lg font-bold">{editId ? 'Edit Product' : 'Add New Product'}</h2>
            <p className="text-xs text-gray-500 mt-0.5">Details on the left · images & colors on the right</p>
          </div>
          <button type="button" onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 grid lg:grid-cols-[1fr_420px] gap-5">
            {error && (
              <div className="lg:col-span-2 text-sm text-rose-600 bg-rose-50 px-4 py-2.5 rounded-xl">{error}</div>
            )}

            {/* ---------- LEFT: details ---------- */}
            <div className="space-y-5">
              <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5">
                <h3 className="text-sm font-bold mb-3 flex items-center gap-2 text-gray-700">
                  <span className="w-7 h-7 rounded-lg bg-[#0b4f86]/10 text-[#0b4f86] flex items-center justify-center"><Package size={15} /></span>
                  Product Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0b4f86]/20 focus:border-[#0b4f86]"
                      placeholder="e.g. Men's Cross-Strap Slide"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Article / SKU</label>
                      <input
                        value={form.article}
                        onChange={(e) => setForm({ ...form, article: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2.5 text-sm"
                        placeholder="e.g. 815"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                      <select
                        value={form.brand}
                        onChange={(e) => setForm({ ...form, brand: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2.5 text-sm bg-white"
                      >
                        <option value="raftar">Raftar Footwear</option>
                        <option value="superstar">Superstar Footwear</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      rows={3}
                      className="w-full border rounded-lg px-3 py-2.5 text-sm"
                      placeholder="Product details for customers..."
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5">
                <h3 className="text-sm font-bold mb-3 flex items-center gap-2 text-gray-700">
                  <span className="w-7 h-7 rounded-lg bg-[#0b4f86]/10 text-[#0b4f86] flex items-center justify-center"><TrendingUp size={15} /></span>
                  Pricing & Stock (PKR)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price *</label>
                    <input
                      required
                      type="number"
                      min="0"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2.5 text-sm"
                      placeholder="400"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Price for 1 pair</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Compare-at</label>
                    <input
                      type="number"
                      min="0"
                      value={form.compareAtPrice}
                      onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2.5 text-sm"
                      placeholder="Optional sale"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                    <input
                      type="number"
                      min="0"
                      value={form.stock}
                      onChange={(e) => setForm({ ...form, stock: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2.5 text-sm"
                    />
                  </div>
                </div>
                {form.price && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[
                      { pack: 'Pack 1', amt: Math.round(form.price) },
                      { pack: 'Pack 6', amt: Math.round(form.price * 6 * 0.95) },
                      { pack: 'Pack 12', amt: Math.round(form.price * 12 * 0.9) },
                    ].map((x) => (
                      <span key={x.pack} className="text-xs px-3 py-1.5 rounded-full bg-blue-50 text-[#0b4f86] font-medium">
                        {x.pack} = Rs {x.amt.toLocaleString()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5">
                <h3 className="text-sm font-bold mb-3 flex items-center gap-2 text-gray-700">
                  <span className="w-7 h-7 rounded-lg bg-[#0b4f86]/10 text-[#0b4f86] flex items-center justify-center"><Layers size={15} /></span>
                  Category & Options
                </h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2.5 text-sm bg-white"
                      >
                        {(categories.includes(form.category) ? categories : [form.category, ...categories]).map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sizes</label>
                      <input
                        value={form.sizes}
                        onChange={(e) => setForm({ ...form, sizes: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2.5 text-sm"
                        placeholder="7/10, 6/9"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                    <input
                      value={form.tags}
                      onChange={(e) => setForm({ ...form, tags: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2.5 text-sm"
                      placeholder="Best Seller, Wholesale, Sale"
                    />
                  </div>
                  <div className="flex flex-wrap gap-3 pt-1">
                    <label className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border cursor-pointer transition ${form.featured ? 'bg-[#0b4f86] text-white border-[#0b4f86]' : 'bg-white text-gray-600 border-gray-200'}`}>
                      <input
                        type="checkbox"
                        checked={form.featured}
                        onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                        className="hidden"
                      />
                      <Star size={15} fill={form.featured ? 'currentColor' : 'none'} /> Featured on homepage
                    </label>
                    <label className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border cursor-pointer transition ${form.isWholesale ? 'bg-[#0b4f86] text-white border-[#0b4f86]' : 'bg-white text-gray-600 border-gray-200'}`}>
                      <input
                        type="checkbox"
                        checked={form.isWholesale}
                        onChange={(e) => setForm({ ...form, isWholesale: e.target.checked })}
                        className="hidden"
                      />
                      <Package size={15} /> Wholesale (packs 1/6/12)
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* ---------- RIGHT: media & colors ---------- */}
            <div className="space-y-5">
              {/* Live preview */}
              <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                <div className="px-4 py-2.5 bg-gray-50 border-b flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-700">Live Preview</h3>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wide">as in shop</span>
                </div>
                <div className="p-4 flex gap-4">
                  <div className="w-28 h-36 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                    <img
                      src={photos[0]?.url || '/images/product-1.svg'}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium line-clamp-2">{form.name || 'Product Name'}</p>
                    {form.article && <p className="text-xs text-gray-400 mt-0.5">Article #{form.article}</p>}
                    <p className="text-[13px] mt-2">
                      <span className="font-semibold text-gray-900">Rs {(Number(form.price) || 0).toLocaleString()}</span>
                      {Number(form.compareAtPrice) > Number(form.price) && (
                        <span className="text-gray-400 line-through ml-2">Rs {Number(form.compareAtPrice).toLocaleString()}</span>
                      )}
                    </p>
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {photos.filter((p) => p.single && p.color).map((p, i) => (
                        <span key={'pc' + i} title="Color" className="w-5 h-5 rounded-full border border-gray-200" style={{ background: p.color }} />
                      ))}
                    </div>
                    <span className="inline-block mt-3 text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full">
                      {form.category}
                    </span>
                  </div>
                </div>
              </div>

              {/* Photos */}
              <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5">
                <h3 className="text-sm font-bold mb-1 flex items-center gap-2 text-gray-700">
                  <span className="w-7 h-7 rounded-lg bg-[#0b4f86]/10 text-[#0b4f86] flex items-center justify-center"><ImageIcon size={15} /></span>
                  Product Photos
                </h3>
                <p className="text-xs text-gray-500 mb-3">
                  The first photo is the main image shown in the shop. The rest appear in the gallery.
                </p>

                {photos.filter((p) => p.url).length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 mb-3">
                    {photos.filter((p) => p.url).map((ph, i) => (
                      <div key={ph.url + i} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                        <img src={ph.url} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.visibility = 'hidden'; }} />
                        {i === 0 && (
                          <span className="absolute left-1.5 top-1.5 px-1.5 py-0.5 rounded-md bg-[#0b4f86] text-white text-[9px] font-bold uppercase tracking-wide">Main</span>
                        )}
                        {i !== 0 && (
                          <button
                            type="button"
                            onClick={() => makePhotoMain(ph.url)}
                            className="absolute left-1.5 top-1.5 p-1 bg-white/90 border rounded-md text-gray-400 hover:text-[#0b4f86] shadow"
                            title="Make this the main photo"
                          >
                            <Star size={11} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removePhoto(photos.findIndex((x) => x.url === ph.url))}
                          className="absolute top-1 right-1 p-1 bg-white/90 border rounded-full text-rose-500 shadow hover:bg-rose-50"
                          title="Remove photo"
                        >
                          <Trash2 size={11} />
                        </button>
                        {ph.single && (
                          <div className="absolute inset-x-0 bottom-0 flex items-center gap-1.5 px-1.5 py-1 bg-white/95 border-t">
                            <label title="Pick a color for this photo" className="shrink-0 cursor-pointer">
                              <span className="block w-4 h-4 rounded-full border border-gray-300" style={{ background: ph.color || '#ffffff' }} />
                              <input
                                type="color"
                                className="hidden"
                                value={ph.color || '#0071e3'}
                                onChange={(e) => setPhotoColor(i, e.target.value)}
                              />
                            </label>
                            <input
                              value={ph.colorName || ''}
                              onChange={(e) => setPhotoColorName(i, e.target.value)}
                              placeholder={ph.color ? 'color name (e.g. Brown)' : 'tap swatch for a color'}
                              className="w-full min-w-0 bg-transparent text-[10px] text-gray-600 outline-none placeholder:text-gray-400"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Choose how to add photos — only one option is active at a time */}
                <div className="grid grid-cols-2 gap-2.5 mb-3">
                  <button
                    type="button"
                    onClick={() => setPhotoMode((m) => (m === 'single' ? null : 'single'))}
                    className={`flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-semibold border transition ${
                      photoMode === 'single'
                        ? 'bg-[#0b4f86] text-white border-[#0b4f86] shadow'
                        : photoMode
                          ? 'opacity-40 pointer-events-none bg-gray-50 text-gray-400 border-gray-100'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-[#0b4f86]/50 hover:bg-blue-50/40'
                    }`}
                  >
                    <Plus size={15} /> Option 1 · Single + color
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhotoMode((m) => (m === 'multiple' ? null : 'multiple'))}
                    className={`flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-semibold border transition ${
                      photoMode === 'multiple'
                        ? 'bg-[#0b4f86] text-white border-[#0b4f86] shadow'
                        : photoMode
                          ? 'opacity-40 pointer-events-none bg-gray-50 text-gray-400 border-gray-100'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-[#0b4f86]/50 hover:bg-blue-50/40'
                    }`}
                  >
                    <Upload size={15} /> Option 2 · Multiple, no color
                  </button>
                </div>

                {photoMode === 'single' && (
                  <div className="mb-3 border-2 border-[#0b4f86]/30 rounded-xl p-3 space-y-2.5 bg-blue-50/30">
                    <p className="text-xs font-medium text-[#0b4f86]">
                      Add one photo at a time — this stays open so you can add more right away.
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <label className="flex-1 min-w-0">
                        <span className="block text-xs font-medium text-gray-500 mb-1">Choose a file</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setSingleFile(e.target.files?.[0] || null)}
                          className="w-full text-sm"
                        />
                        {singleFile && <span className="text-xs text-emerald-600 mt-1">✓ {singleFile.name}</span>}
                      </label>
                      <span className="text-xs text-gray-400 sm:px-1">or</span>
                      <label className="flex-1 min-w-0">
                        <span className="block text-xs font-medium text-gray-500 mb-1">Paste an image URL</span>
                        <input
                          type="url"
                          value={singleUrl}
                          onChange={(e) => setSingleUrl(e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                          placeholder="https://…"
                        />
                      </label>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-end gap-2">
                      <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                        <span className="w-7 h-7 rounded-full border-2 border-white shadow ring-1 ring-gray-300" style={{ background: singleColor }} />
                        <input
                          type="color"
                          className="hidden"
                          value={singleColor}
                          onChange={(e) => setSingleColor(e.target.value)}
                        />
                        Color
                      </label>
                      <label className="flex-1 min-w-0">
                        <span className="block text-xs font-medium text-gray-500 mb-1">Color name (shown in shop)</span>
                        <input
                          type="text"
                          value={singleName}
                          onChange={(e) => setSingleName(e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                          placeholder="e.g. Brown, Black, Red"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={applySingleAdd}
                        disabled={singleUploading}
                        className="flex items-center justify-center gap-1.5 bg-[#0b4f86] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#083d6a] disabled:opacity-60 sm:px-5"
                      >
                        {singleUploading && <Loader2 size={14} className="animate-spin" />}
                        Add another photo
                      </button>
                    </div>
                  </div>
                )}

                {photoMode === 'multiple' && (
                  <div className="mb-3 border-2 border-[#0b4f86]/30 rounded-xl p-3 bg-blue-50/30">
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleAddPhotos}
                    />
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      disabled={uploadingFiles}
                      className="w-full border-2 border-dashed border-gray-300 rounded-xl py-4 text-center cursor-pointer hover:border-[#0b4f86]/50 hover:bg-blue-50/40 bg-white transition disabled:opacity-60"
                    >
                      {uploadingFiles ? (
                        <span className="flex items-center justify-center gap-2 text-sm text-gray-500">
                          <Loader2 size={17} className="animate-spin" />
                          Uploading photo {uploadProgress.done + 1} of {uploadProgress.total}…
                        </span>
                      ) : (
                        <span className="flex flex-col items-center text-gray-500">
                          <Upload size={19} className="mb-1 text-gray-400" />
                          <span className="text-sm font-medium text-gray-600">Select one or more photos</span>
                          <span className="text-xs text-gray-400 mt-0.5">JPG, PNG, WebP · no color per photo</span>
                        </span>
                      )}
                    </button>
                    <div className="mt-2.5 flex gap-2">
                      <input
                        type="url"
                        value={urlDraft}
                        onChange={(e) => setUrlDraft(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); appendPhoto(urlDraft); setUrlDraft(''); } }}
                        className="flex-1 min-w-0 border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                        placeholder="…or paste an image URL"
                      />
                      <button
                        type="button"
                        onClick={() => { appendPhoto(urlDraft); setUrlDraft(''); }}
                        className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 shrink-0 bg-white"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}

                {photoMode && (
                  <button
                    type="button"
                    onClick={() => setPhotoMode(null)}
                    className="text-[11px] text-gray-400 hover:text-[#0b4f86] mb-2"
                  >
                    ← Close this option to enable the other one
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="px-4 sm:px-6 py-4 border-t bg-white flex justify-end gap-3 sticky bottom-0 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:pb-4">
            <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 text-sm border rounded-xl hover:bg-gray-50">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-[#0b4f86] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#083d6a] disabled:opacity-60 shadow"
            >
              {saving ? (
                <span className="flex items-center gap-2"><Upload size={15} className="animate-spin" /> Saving…</span>
              ) : (
                <>{editId ? 'Update Product' : 'Create Product'}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
)}
    </div>
  );
}
