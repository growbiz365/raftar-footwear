import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Plus, Trash2, Pencil, Save, ChevronUp, ChevronDown } from 'lucide-react';
import ImageField from '../../components/admin/ImageField';
import { useToast } from '../../components/admin/Toast';

const emptyTile = { title: '', subtitle: '', cta: 'Shop Now', to: '/collections/raftar', img: '' };
const emptyTestimonial = { quote: '', name: '', city: '', role: '', img: '' };

const inputCls =
  'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0b4f86]/20 focus:border-[#0b4f86]';
const labelCls = 'block text-xs font-medium text-gray-600 mb-1';

const toLocalInput = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

export default function AdminHomeSections() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const [promo, setPromo] = useState({ eyebrow: '', title: '', tiles: [] });
  const [sale, setSale] = useState({
    badge: '',
    title: '',
    subtitle: '',
    buttonText: '',
    buttonLink: '',
    bgImg: '',
    endDate: '',
  });
  const [testimonials, setTestimonials] = useState({ eyebrow: '', title: '', items: [] });

  const [modal, setModal] = useState(null);
  const [draft, setDraft] = useState({});

  const updraft = (k, v) => setDraft((d) => ({ ...d, [k]: v }));

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/admin/settings');
        const d = data.data || {};

        const p = d.promoTiles || {};
        setPromo({
          eyebrow: p.eyebrow || '',
          title: p.title || '',
          tiles: Array.isArray(p.tiles) ? p.tiles.map((t) => ({ ...emptyTile, ...t })) : [],
        });

        const s = d.saleCountdown || {};
        setSale({
          badge: s.badge || '',
          title: s.title || '',
          subtitle: s.subtitle || '',
          buttonText: s.buttonText || '',
          buttonLink: s.buttonLink || '',
          bgImg: s.bgImg || '',
          endDate: toLocalInput(s.endDate),
        });

        const t = d.testimonials || {};
        setTestimonials({
          eyebrow: t.eyebrow || '',
          title: t.title || '',
          items: Array.isArray(t.items) ? t.items.map((x) => ({ ...emptyTestimonial, ...x })) : [],
        });
      } catch {
        toast('Could not load settings — is the backend running?', 'info');
      }
      setLoading(false);
    })();
  }, []);

  const openAddTile = () => {
    setDraft({ ...emptyTile });
    setModal({ type: 'tile' });
  };
  const openEditTile = (tile, index) => {
    setDraft({ ...emptyTile, ...tile });
    setModal({ type: 'tile', index });
  };
  const openAddTestimonial = () => {
    setDraft({ ...emptyTestimonial });
    setModal({ type: 'testimonial' });
  };
  const openEditTestimonial = (item, index) => {
    setDraft({ ...emptyTestimonial, ...item });
    setModal({ type: 'testimonial', index });
  };

  const saveDraft = () => {
    const isEdit = modal?.index != null;
    if (modal.type === 'tile') {
      const t = { ...emptyTile, ...draft };
      setPromo((p) => ({
        ...p,
        tiles: isEdit ? p.tiles.map((x, i) => (i === modal.index ? t : x)) : [...p.tiles, t],
      }));
    } else {
      const t = { ...emptyTestimonial, ...draft };
      setTestimonials((p) => ({
        ...p,
        items: isEdit ? p.items.map((x, i) => (i === modal.index ? t : x)) : [...p.items, t],
      }));
    }
    setModal(null);
  };

  const removeTile = (i) => {
    setPromo((p) => ({ ...p, tiles: p.tiles.filter((_, idx) => idx !== i) }));
  };
  const removeTestimonial = (i) => {
    setTestimonials((p) => ({ ...p, items: p.items.filter((_, idx) => idx !== i) }));
  };
  const moveTile = (i, dir) =>
    setPromo((p) => {
      const next = [...p.tiles];
      const j = i + dir;
      if (j < 0 || j >= next.length) return p;
      [next[i], next[j]] = [next[j], next[i]];
      return { ...p, tiles: next };
    });
  const moveTestimonial = (i, dir) =>
    setTestimonials((p) => {
      const next = [...p.items];
      const j = i + dir;
      if (j < 0 || j >= next.length) return p;
      [next[i], next[j]] = [next[j], next[i]];
      return { ...p, items: next };
    });

  const save = async () => {
    setSaving(true);
    setMsg('');
    try {
      await api.put('/admin/settings/promoTiles', {
        value: {
          eyebrow: promo.eyebrow,
          title: promo.title,
          tiles: promo.tiles.filter((t) => t.title || t.img),
        },
      });
      await api.put('/admin/settings/saleCountdown', {
        value: {
          ...sale,
          endDate: sale.endDate ? new Date(sale.endDate).toISOString() : null,
        },
      });
      await api.put('/admin/settings/testimonials', {
        value: {
          eyebrow: testimonials.eyebrow,
          title: testimonials.title,
          items: testimonials.items.filter((t) => t.quote || t.name),
        },
      });
      setMsg('✓ Home sections saved — refresh the storefront to see changes');
      toast('Home sections saved');
    } catch (e) {
      setMsg(`✗ ${e?.response?.data?.message || 'Save failed — is the backend running?'}`);
      toast('Save failed', 'error');
    }
    setSaving(false);
    setTimeout(() => setMsg(''), 4000);
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-4 max-w-6xl">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-6xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Home Sections</h1>
          <p className="text-sm text-gray-500 mt-1">
            Offer tiles, sale countdown &amp; testimonials — upload images by file or paste URL
          </p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="bg-[#0b4f86] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#083d6a] disabled:opacity-60 shadow-sm"
        >
          {saving ? 'Saving…' : 'Save all settings'}
        </button>
      </div>

      {msg && (
        <div className="mb-5 text-sm bg-emerald-50 text-emerald-800 border border-emerald-100 px-4 py-3 rounded-xl">
          {msg}
        </div>
      )}

      {/* Offer tiles */}
      <section className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 mb-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">Offer tiles</h2>
          <button
            type="button"
            onClick={openAddTile}
            className="flex items-center gap-1.5 bg-white border border-gray-200 hover:border-[#0b4f86] text-[#0b4f86] px-4 py-2 rounded-xl text-sm font-medium transition"
          >
            <Plus size={16} /> Add tile
          </button>
        </div>
        <p className="text-xs text-gray-500 mb-4">Section heading and the 4 “Big offers” cards on the homepage</p>

        <div className="grid sm:grid-cols-2 gap-4 mb-5">
          <div>
            <label className={labelCls}>Section eyebrow</label>
            <input
              className={inputCls}
              value={promo.eyebrow}
              onChange={(e) => setPromo((p) => ({ ...p, eyebrow: e.target.value }))}
              placeholder="Big offers on your favorite! 💖"
            />
          </div>
          <div>
            <label className={labelCls}>Section title</label>
            <input
              className={inputCls}
              value={promo.title}
              onChange={(e) => setPromo((p) => ({ ...p, title: e.target.value }))}
              placeholder="Where Style Meets Comfort"
            />
          </div>
        </div>

        <div className="space-y-3">
          {promo.tiles.map((t, i) => (
            <div key={i} className="border border-gray-200 rounded-xl p-4 flex gap-4 items-center">
              <div className="w-20 h-16 sm:w-24 sm:h-20 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                {t.img ? (
                  <img
                    src={t.img}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No image</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-800 truncate">{t.title || 'Untitled tile'}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${t.title || t.img ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                    {t.title || t.img ? 'Active' : 'Empty'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-0.5 truncate">
                  {[t.subtitle, t.cta].filter(Boolean).join(' · ') || 'No text'}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button type="button" onClick={() => moveTile(i, -1)} disabled={i === 0} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30" title="Move up">
                  <ChevronUp size={16} />
                </button>
                <button type="button" onClick={() => moveTile(i, 1)} disabled={i === promo.tiles.length - 1} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30" title="Move down">
                  <ChevronDown size={16} />
                </button>
                <button type="button" onClick={() => openEditTile(t, i)} className="p-2 rounded-lg bg-[#0b4f86]/10 text-[#0b4f86] hover:bg-[#0b4f86]/20" title="Edit tile">
                  <Pencil size={15} />
                </button>
                <button type="button" onClick={() => removeTile(i)} className="p-2 rounded-lg text-rose-500 hover:bg-rose-50" title="Remove tile">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sale countdown */}
      <section className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 mb-6 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">Sale countdown</h2>
        <p className="text-xs text-gray-500 mb-4">The “Biggest sale of the year” counter banner on the homepage</p>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Badge text</label>
            <input
              className={inputCls}
              value={sale.badge}
              onChange={(e) => setSale((s) => ({ ...s, badge: e.target.value }))}
              placeholder="Limited time"
            />
          </div>
          <div>
            <label className={labelCls}>Title</label>
            <input
              className={inputCls}
              value={sale.title}
              onChange={(e) => setSale((s) => ({ ...s, title: e.target.value }))}
              placeholder="Biggest sale of the year"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Subtitle</label>
            <input
              className={inputCls}
              value={sale.subtitle}
              onChange={(e) => setSale((s) => ({ ...s, subtitle: e.target.value }))}
              placeholder="Shop before time runs out. Up to 70% OFF wholesale packs"
            />
          </div>
          <div>
            <label className={labelCls}>Countdown ends at</label>
            <input
              type="datetime-local"
              className={inputCls}
              value={sale.endDate}
              onChange={(e) => setSale((s) => ({ ...s, endDate: e.target.value }))}
            />
            <p className="text-[11px] text-gray-400 mt-1">Empty = 90 days from today</p>
          </div>
          <div>
            <label className={labelCls}>Background image</label>
            <ImageField label="" value={sale.bgImg} onChange={(v) => setSale((s) => ({ ...s, bgImg: v }))} />
          </div>
          <div>
            <label className={labelCls}>Button text</label>
            <input
              className={inputCls}
              value={sale.buttonText}
              onChange={(e) => setSale((s) => ({ ...s, buttonText: e.target.value }))}
              placeholder="Shop Now"
            />
          </div>
          <div>
            <label className={labelCls}>Button link</label>
            <input
              className={inputCls}
              value={sale.buttonLink}
              onChange={(e) => setSale((s) => ({ ...s, buttonLink: e.target.value }))}
              placeholder="/shop"
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 mb-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">Testimonials</h2>
          <button
            type="button"
            onClick={openAddTestimonial}
            className="flex items-center gap-1.5 bg-white border border-gray-200 hover:border-[#0b4f86] text-[#0b4f86] px-4 py-2 rounded-xl text-sm font-medium transition"
          >
            <Plus size={16} /> Add testimonial
          </button>
        </div>
        <p className="text-xs text-gray-500 mb-4">Section heading and the “Happy Clients” reviews on the homepage</p>

        <div className="grid sm:grid-cols-2 gap-4 mb-5">
          <div>
            <label className={labelCls}>Section eyebrow</label>
            <input
              className={inputCls}
              value={testimonials.eyebrow}
              onChange={(e) => setTestimonials((p) => ({ ...p, eyebrow: e.target.value }))}
              placeholder="Happy Clients"
            />
          </div>
          <div>
            <label className={labelCls}>Section title</label>
            <input
              className={inputCls}
              value={testimonials.title}
              onChange={(e) => setTestimonials((p) => ({ ...p, title: e.target.value }))}
              placeholder="We Work To Keep Dealers Happy"
            />
          </div>
        </div>

        <div className="space-y-3">
          {testimonials.items.map((t, i) => (
            <div key={i} className="border border-gray-200 rounded-xl p-4 flex gap-4 items-center">
              <div className="w-11 h-11 rounded-full bg-[#0b4f86]/10 text-[#0b4f86] flex items-center justify-center text-sm font-bold shrink-0 overflow-hidden">
                {t.img ? (
                  <img src={t.img} alt="" className="w-full h-full object-cover" />
                ) : (
                  (t.name?.[0] || '?').toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-800 truncate">
                    {t.name || 'Untitled'}{t.city ? ` · ${t.city}` : ''}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${t.quote || t.name ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                    {t.quote || t.name ? 'Active' : 'Empty'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-0.5 truncate">
                  {t.quote ? `“${t.quote}”` : t.role || 'No review'}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button type="button" onClick={() => moveTestimonial(i, -1)} disabled={i === 0} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30" title="Move up">
                  <ChevronUp size={16} />
                </button>
                <button type="button" onClick={() => moveTestimonial(i, 1)} disabled={i === testimonials.items.length - 1} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30" title="Move down">
                  <ChevronDown size={16} />
                </button>
                <button type="button" onClick={() => openEditTestimonial(t, i)} className="p-2 rounded-lg bg-[#0b4f86]/10 text-[#0b4f86] hover:bg-[#0b4f86]/20" title="Edit testimonial">
                  <Pencil size={15} />
                </button>
                <button type="button" onClick={() => removeTestimonial(i)} className="p-2 rounded-lg text-rose-500 hover:bg-rose-50" title="Remove testimonial">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex justify-end sticky bottom-4">
        <button
          onClick={save}
          disabled={saving}
          className="bg-[#0b4f86] text-white px-8 py-3 rounded-xl text-sm font-semibold hover:bg-[#083d6a] disabled:opacity-60 shadow-lg"
        >
          {saving ? 'Saving…' : 'Save all settings'}
        </button>
      </div>

      {/* Modal: tile / testimonial editor */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white z-10">
              <h2 className="text-lg font-semibold">
                {modal.type === 'tile'
                  ? modal.index != null ? 'Edit tile' : 'Add tile'
                  : modal.index != null ? 'Edit testimonial' : 'Add testimonial'}
              </h2>
              <button onClick={() => setModal(null)} className="p-1 hover:bg-gray-100 rounded">
                <Plus size={20} className="rotate-45" />
              </button>
            </div>

            {modal.type === 'tile' ? (
              <div className="p-5 space-y-3">
                <ImageField
                  label="Tile image (file upload or URL)"
                  value={draft.img || ''}
                  onChange={(v) => updraft('img', v)}
                />
                <div>
                  <label className={labelCls}>Title</label>
                  <input
                    className={inputCls}
                    value={draft.title || ''}
                    onChange={(e) => updraft('title', e.target.value)}
                    placeholder="Women's Favorite Styles"
                  />
                </div>
                <div>
                  <label className={labelCls}>Subtitle / offer</label>
                  <input
                    className={inputCls}
                    value={draft.subtitle || ''}
                    onChange={(e) => updraft('subtitle', e.target.value)}
                    placeholder="Upto 50% Off"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Button text</label>
                    <input
                      className={inputCls}
                      value={draft.cta || ''}
                      onChange={(e) => updraft('cta', e.target.value)}
                      placeholder="Shop Now"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Link to</label>
                    <input
                      className={inputCls}
                      value={draft.to || ''}
                      onChange={(e) => updraft('to', e.target.value)}
                      placeholder="/collections/women"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-5 space-y-3">
                <ImageField
                  label="Client photo (optional — file upload or URL)"
                  value={draft.img || ''}
                  onChange={(v) => updraft('img', v)}
                />
                <div>
                  <label className={labelCls}>Quote</label>
                  <textarea
                    rows={3}
                    className={inputCls}
                    value={draft.quote || ''}
                    onChange={(e) => updraft('quote', e.target.value)}
                    placeholder="True to size and durable for daily wear…"
                  />
                </div>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div>
                    <label className={labelCls}>Name</label>
                    <input
                      className={inputCls}
                      value={draft.name || ''}
                      onChange={(e) => updraft('name', e.target.value)}
                      placeholder="Cory"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>City</label>
                    <input
                      className={inputCls}
                      value={draft.city || ''}
                      onChange={(e) => updraft('city', e.target.value)}
                      placeholder="Lahore"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Role</label>
                    <input
                      className={inputCls}
                      value={draft.role || ''}
                      onChange={(e) => updraft('role', e.target.value)}
                      placeholder="Fashion retailer"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 p-5 border-t sticky bottom-0 bg-white">
              <button onClick={() => setModal(null)} className="px-4 py-2.5 text-sm border rounded-xl hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={saveDraft} className="bg-[#0b4f86] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#083d6a]">
                <Save size={16} className="inline mr-1.5 -mt-0.5" />
                {modal.index != null ? 'Save changes' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}