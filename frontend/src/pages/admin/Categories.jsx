import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import api from '../../services/api';
import { Plus, Trash2, X, Search, Layers, Package, AlertTriangle } from 'lucide-react';
import { useToast } from '../../components/admin/Toast';

export default function AdminCategories() {
  const { toast, confirm } = useToast();
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', image: '' });
  const [file, setFile] = useState(null);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(new Set());

  const load = () => api.get('/admin/categories').then(r => setCategories(r.data?.data || [])).catch(() => {});

  useEffect(() => { load(); }, []);

  const totalProducts = categories.reduce((s, c) => s + (c.count || 0), 0);
  const emptyCats = categories.filter((c) => (c.count || 0) === 0).length;

  const stats = [
    { label: 'Total Categories', value: categories.length, icon: Layers, color: 'bg-blue-500' },
    { label: 'Products in Categories', value: totalProducts, icon: Package, color: 'bg-emerald-500' },
    { label: 'Empty Categories', value: emptyCats, icon: AlertTriangle, color: 'bg-rose-500' },
  ];

  const filtered = categories.filter((c) => (c.name || '').toLowerCase().includes(query.trim().toLowerCase()));

  const handleCreate = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('name', form.name);
    fd.append('description', form.description);
    if (form.image) fd.append('image', form.image);
    if (file) fd.append('image', file);
    await api.post('/admin/categories', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    setShowForm(false);
    setForm({ name: '', description: '', image: '' });
    setFile(null);
    load();
    toast('Category created');
  };

  const handleDelete = async (id) => {
    const ok = await confirm('Delete this category?');
    if (!ok) return;
    await api.delete(`/admin/categories/${id}`);
    load();
    toast('Category deleted');
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    const ok = await confirm(`Delete ${selected.size} selected categor${selected.size > 1 ? 'ies' : 'y'}?`);
    if (!ok) return;
    try {
      await Promise.all([...selected].map((id) => api.delete(`/admin/categories/${id}`)));
      toast(`${selected.size} categor${selected.size > 1 ? 'ies' : 'y'} deleted`);
    } catch {
      toast('Some categories could not be deleted', 'error');
    }
    setSelected(new Set());
    load();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl font-semibold">Categories ({categories.length})</h1>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-lg text-sm font-medium">
          <Plus size={16} /> Add Category
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

      <div className="relative mb-5 max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search categories..."
          className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-[#0b4f86]"
        />
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between mb-6">
              <h2 className="text-lg font-medium">New Category</h2>
              <button onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <input placeholder="Name" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-black" />
              <input placeholder="Image URL (or upload below)" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })}
                className="w-full border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-black" />
              <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} className="text-sm" />
              <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-black" rows={2} />
              <button type="submit" className="w-full bg-black text-white py-3 rounded-lg text-sm font-medium">Create</button>
            </form>
          </div>
        </div>
      )}

      {selected.size > 0 && (
        <div className="flex items-center justify-between bg-rose-50 border border-rose-100 rounded-xl px-4 py-2.5 mb-4">
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

      <div className="flex items-center gap-2 mb-4">
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={filtered.length > 0 && filtered.every((c) => selected.has(c._id))}
            onChange={(e) => {
              setSelected((prev) => {
                const next = new Set(prev);
                if (e.target.checked) filtered.forEach((c) => next.add(c._id));
                else filtered.forEach((c) => next.delete(c._id));
                return next;
              });
            }}
            className="accent-[#0b4f86]"
          />
          Select all
        </label>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(c => (
          <div key={c._id} className="bg-white rounded-xl shadow-sm overflow-hidden flex relative">
            <input
              type="checkbox"
              checked={selected.has(c._id)}
              onChange={(e) => {
                setSelected((prev) => {
                  const next = new Set(prev);
                  if (e.target.checked) next.add(c._id);
                  else next.delete(c._id);
                  return next;
                });
              }}
              className="accent-rose-600 absolute top-2 left-2 z-10"
              title="Select"
            />
            <img src={c.image || '/images/cat-women.svg'} alt="" className="w-24 h-24 object-cover" />
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-medium">{c.name}</h3>
                <p className="text-xs text-gray-500">{c.count || 0} products</p>
                {c.description && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{c.description}</p>}
              </div>
              <button onClick={() => handleDelete(c._id)} className="text-rose-500 text-xs self-end flex items-center gap-1">
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center text-gray-400 py-10">No categories found</div>
        )}
      </div>
    </div>
  );
}
