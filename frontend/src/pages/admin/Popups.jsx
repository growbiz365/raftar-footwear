import { useEffect, useState } from 'react';
import api from '../../services/api';
import { getLocalSettings, saveLocalSettings } from '../../data/catalog';
import ImageField from '../../components/admin/ImageField';
import { useToast } from '../../components/admin/Toast';
import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';

const emptyFeature = { title: '', text: '' };
const emptyPack = { label: '', sub: '' };

const DEFAULT_POPUP = {
  enabled: false,
  layout: 'showcase',
  delayMs: 4000,
  badge: 'Best Seller',
  images: ['', '', '', ''],
  brand: 'Raftar',
  brandSub: 'FOOTWEAR',
  title: 'Wholesale Special',
  price: '',
  rating: '',
  reviews: '',
  description: '',
  features: [emptyFeature, emptyFeature, emptyFeature],
  packs: [emptyPack, emptyPack],
  buttonText: 'Order Bulk Now',
  redirectUrl: 'https://wa.me/923338788861',
  message: '',
  image: '',
};

const inputCls =
  'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0b4f86]/20';

export default function AdminPopups() {
  const { toast } = useToast();
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState(DEFAULT_POPUP);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/admin/settings');
        const d = data.data || {};
        const base = { ...DEFAULT_POPUP };
        if (d.popup) {
          const src = d.popup;
          setPopup({
            ...base,
            ...src,
            images: Array.isArray(src.images) && src.images.length ? src.images : base.images,
            features: Array.isArray(src.features) ? src.features : base.features,
            packs: Array.isArray(src.packs) ? src.packs : base.packs,
          });
        } else if (d.exitPopup) {
          setPopup((p) => ({
            ...p,
            ...d.exitPopup,
            layout: 'simple',
            message: d.exitPopup.subtitle || d.exitPopup.message || p.message,
            redirectUrl: d.exitPopup.redirectUrl || d.exitPopup.link || p.redirectUrl,
          }));
        }
      } catch {
        const local = getLocalSettings();
        if (local.popup) setPopup((p) => ({ ...p, ...local.popup }));
      }
      setLoading(false);
    })();
  }, []);

  const set = (patch) => setPopup((p) => ({ ...p, ...patch }));

  const setImage = (i, url) => set({ images: popup.images.map((img, j) => (j === i ? url : img)) });

  const setFeature = (i, patch) =>
    set({ features: popup.features.map((f, j) => (j === i ? { ...f, ...patch } : f)) });
  const addFeature = () => set({ features: [...popup.features, emptyFeature] });
  const removeFeature = (i) => set({ features: popup.features.filter((_, j) => j !== i) });
  const moveFeature = (i, dir) => set({
    features: moveInList(popup.features, i, dir),
  });

  const setPack = (i, patch) =>
    set({ packs: popup.packs.map((p, j) => (j === i ? { ...p, ...patch } : p)) });
  const addPack = () => set({ packs: [...popup.packs, emptyPack] });
  const removePack = (i) => set({ packs: popup.packs.filter((_, j) => j !== i) });
  const movePack = (i, dir) => set({ packs: moveInList(popup.packs, i, dir) });

  const save = async () => {
    setSaving(true);
    setMsg('');
    const payload = {
      ...popup,
      images: popup.images.filter((i) => i),
      features: popup.features.filter((f) => f.title || f.text),
      packs: popup.packs.filter((p) => p.label || p.sub),
    };
    try {
      await api.put('/admin/settings/popup', { value: payload });
      setMsg('✓ Popup saved');
      toast('Popup saved');
    } catch {
      saveLocalSettings({ ...getLocalSettings(), popup: payload });
      setMsg('✓ Saved locally (backend offline)');
      toast('Saved locally (backend offline)', 'info');
    }
    setSaving(false);
    setTimeout(() => setMsg(''), 3500);
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-4">
        <div className="h-40 bg-gray-200 animate-pulse rounded-2xl" />
      </div>
    );
  }

  const images = popup.images.filter((i) => i);
  const mainImage = images[0];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Site Popup</h1>
          <p className="text-sm text-gray-500 mt-1">
            Product showcase popup with gallery, features &amp; packs — or the simple design.
          </p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="bg-[#0b4f86] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#083d6a] disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save popup'}
        </button>
      </div>

      {msg && (
        <div className="mb-5 text-sm bg-emerald-50 text-emerald-800 border border-emerald-100 px-4 py-3 rounded-xl">
          {msg}
        </div>
      )}

      <div className="grid xl:grid-cols-[1fr_520px] gap-6">
        {/* Form */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="flex items-center gap-3 text-sm font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={!!popup.enabled}
                onChange={(e) => set({ enabled: e.target.checked })}
                className="w-4 h-4 rounded accent-[#0b4f86]"
              />
              Enable popup on storefront
            </label>
            <div className="flex items-center rounded-xl border border-gray-200 overflow-hidden">
              {[
                { k: 'showcase', l: 'Showcase' },
                { k: 'simple', l: 'Simple' },
              ].map((d) => (
                <button
                  key={d.k}
                  onClick={() => set({ layout: d.k })}
                  className={`px-4 py-2 text-sm font-medium transition ${
                    popup.layout === d.k ? 'bg-[#0b4f86] text-white' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {d.l}
                </button>
              ))}
            </div>
          </div>

          {popup.layout !== 'simple' ? (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Badge</label>
                  <input className={inputCls} value={popup.badge || ''} onChange={(e) => set({ badge: e.target.value })} placeholder="Best Seller" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                  <input className={inputCls} value={popup.brand || ''} onChange={(e) => set({ brand: e.target.value })} placeholder="Raftar" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand sub</label>
                  <input className={inputCls} value={popup.brandSub || ''} onChange={(e) => set({ brandSub: e.target.value })} placeholder="FOOTWEAR" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price / amount</label>
                  <input className={inputCls} value={popup.price || ''} onChange={(e) => set({ price: e.target.value })} placeholder="Rs. 1,250" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input className={inputCls} value={popup.title || ''} onChange={(e) => set({ title: e.target.value })} placeholder="Wholesale Special" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                  <input className={inputCls} value={popup.rating || ''} onChange={(e) => set({ rating: e.target.value })} placeholder="4.8" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reviews text</label>
                  <input className={inputCls} value={popup.reviews || ''} onChange={(e) => set({ reviews: e.target.value })} placeholder="124 reviews" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  className={inputCls}
                  value={popup.description || ''}
                  onChange={(e) => set({ description: e.target.value })}
                  placeholder="Short product description for the popup…"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gallery images</label>
                <div className="grid grid-cols-2 gap-3">
                  {popup.images.map((url, i) => (
                    <ImageField
                      key={i}
                      label={`Image ${i === 0 ? '(main)' : i + 1}`}
                      help="File upload or paste URL"
                      value={url || ''}
                      onChange={(v) => setImage(i, v)}
                    />
                  ))}
                </div>
              </div>

              {/* Features as rows */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Features</label>
                  <button
                    type="button"
                    onClick={addFeature}
                    className="flex items-center gap-1.5 bg-white border border-gray-200 hover:border-[#0b4f86] text-[#0b4f86] px-3 py-1.5 rounded-lg text-xs font-medium transition"
                  >
                    <Plus size={14} /> Add feature
                  </button>
                </div>
                <div className="space-y-2">
                  {popup.features.map((f, i) => (
                    <RowEdit
                      key={`f-${i}`}
                      index={i}
                      list={popup.features}
                      onMoveUp={() => moveFeature(i, -1)}
                      onMoveDown={() => moveFeature(i, 1)}
                      onRemove={() => removeFeature(i)}
                    >
                      <input className={inputCls} value={f.title || ''} onChange={(e) => setFeature(i, { title: e.target.value })} placeholder={`Feature ${i + 1} title`} />
                      <input className={inputCls} value={f.text || ''} onChange={(e) => setFeature(i, { text: e.target.value })} placeholder="Short line" />
                    </RowEdit>
                  ))}
                </div>
              </div>

              {/* Packs as rows */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Packs</label>
                  <button
                    type="button"
                    onClick={addPack}
                    className="flex items-center gap-1.5 bg-white border border-gray-200 hover:border-[#0b4f86] text-[#0b4f86] px-3 py-1.5 rounded-lg text-xs font-medium transition"
                  >
                    <Plus size={14} /> Add pack
                  </button>
                </div>
                <div className="space-y-2">
                  {popup.packs.map((p, i) => (
                    <RowEdit
                      key={`p-${i}`}
                      index={i}
                      list={popup.packs}
                      onMoveUp={() => movePack(i, -1)}
                      onMoveDown={() => movePack(i, 1)}
                      onRemove={() => removePack(i)}
                    >
                      <input className={inputCls} value={p.label || ''} onChange={(e) => setPack(i, { label: e.target.value })} placeholder={i === 0 ? '6 Pairs' : '12 Pairs'} />
                      <input className={inputCls} value={p.sub || ''} onChange={(e) => setPack(i, { sub: e.target.value })} placeholder="Get special price" />
                    </RowEdit>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input className={inputCls} value={popup.title || ''} onChange={(e) => set({ title: e.target.value })} placeholder="Popup title" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea rows={3} className={inputCls} value={popup.message || ''} onChange={(e) => set({ message: e.target.value })} placeholder="Short message" />
              </div>
              <ImageField label="Popup image (optional)" help="File upload or paste URL" value={popup.image || ''} onChange={(url) => set({ image: url })} />
            </>
          )}

          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Button text</label>
              <input className={inputCls} value={popup.buttonText || ''} onChange={(e) => set({ buttonText: e.target.value })} placeholder="Order Bulk Now" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Show after (milliseconds)</label>
              <input type="number" min={0} value={popup.delayMs ?? 2500} onChange={(e) => set({ delayMs: parseInt(e.target.value) || 0 })} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Redirect link</label>
              <input className={inputCls} value={popup.redirectUrl || ''} onChange={(e) => set({ redirectUrl: e.target.value })} placeholder="https://wa.me/… or /shop" />
            </div>
          </div>
        </div>

        {/* Live preview */}
        <div className="bg-slate-100 rounded-2xl p-5 sm:p-8 flex items-center justify-center min-h-[420px]">
          {popup.layout !== 'simple' ? (
            <div className="bg-white rounded-[20px] shadow-xl w-full max-w-[560px] grid sm:grid-cols-2 gap-6 p-5 max-h-[70vh] overflow-y-auto">
              <div className="space-y-3">
                <div className="relative aspect-square bg-[#f8f6f0] rounded-2xl overflow-hidden">
                  {popup.badge && (
                    <span className="absolute top-3 left-3 z-10 bg-amber-100 text-amber-700 text-[10px] font-bold px-2.5 py-1 rounded-full">
                      ★ {popup.badge}
                    </span>
                  )}
                  {mainImage && <img src={mainImage} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {images.slice(0, 4).map((img, i) => (
                    <div key={i} className="aspect-square bg-[#f8f6f0] rounded-lg overflow-hidden border-2 border-[#0b4f86]/30">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="font-serif italic font-bold text-lg text-slate-800">{popup.brand || 'Brand'}</div>
                <div className="text-[8px] tracking-[0.15em] uppercase text-slate-500 -mt-0.5 mb-3">{popup.brandSub}</div>
                <h3 className="font-serif text-xl text-slate-900 font-medium mb-1">{popup.title || 'Title'}</h3>
                {popup.price && <div className="text-base font-extrabold text-[#0b4f86] mb-1.5">{popup.price}</div>}
                {(popup.rating || popup.reviews) && (
                  <div className="flex items-center gap-1 text-[10px] text-slate-500 mb-2">
                    <span className="text-amber-500">{'★★★★★'}</span>
                    {popup.rating && <span>({popup.rating})</span>}
                    {popup.reviews && <span>{popup.reviews}</span>}
                  </div>
                )}
                {popup.description && <p className="text-[11px] text-slate-500 leading-relaxed mb-3 line-clamp-3">{popup.description}</p>}
                {popup.features.filter((f) => f.title).slice(0, 3).map((f, i) => (
                  <div key={i} className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 bg-blue-50 rounded-full text-[#0b4f86] flex items-center justify-center text-[10px]">✓</span>
                    <div className="text-[10px]">
                      <div className="font-bold text-slate-800">{f.title}</div>
                      <div className="text-slate-500">{f.text}</div>
                    </div>
                  </div>
                ))}
                {popup.packs.filter((p) => p.label).length > 0 && (
                  <>
                    <div className="text-[10px] font-bold text-slate-800 mt-3 mb-1.5">Select Pack Size</div>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {popup.packs.filter((p) => p.label).map((p, i) => (
                        <div key={i} className={`rounded-lg px-2 py-2 text-center border ${i === 0 ? 'bg-[#0b4f86] border-[#0b4f86] text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
                          <div className="block text-[11px] font-bold">{p.label}</div>
                          {p.sub && <div className="block text-[9px] opacity-80">{p.sub}</div>}
                        </div>
                      ))}
                    </div>
                  </>
                )}
                <div className="w-full bg-[#0b4f86] text-white py-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                  </svg>
                  {popup.buttonText || 'Button'}
                </div>
                <p className="mt-2 text-center text-[10px] text-gray-400">Preview only</p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl max-w-sm w-full shadow-xl overflow-hidden">
              {popup.image && !popup.image.startsWith('blob:') && (
                <div className="aspect-[16/9] bg-gray-100">
                  <img src={popup.image} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-6 text-center">
                <h3 className="text-lg font-display font-medium mb-2">{popup.title || 'Title'}</h3>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">{popup.message || 'Message preview'}</p>
                <div className="w-full bg-[#0b4f86] text-white py-3 rounded-xl text-sm font-semibold">{popup.buttonText || 'Button'}</div>
                <p className="mt-2 text-xs text-gray-400">Preview only</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function moveInList(list, i, dir) {
  const next = [...list];
  const j = i + dir;
  if (j < 0 || j >= next.length) return next;
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

function RowEdit({ index, list, onMoveUp, onMoveDown, onRemove, children }) {
  const first = index === 0;
  const last = index === list.length - 1;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">{children}</div>
      <div className="flex flex-col shrink-0">
        <button
          type="button"
          onClick={onMoveUp}
          disabled={first}
          className="p-1 text-gray-400 hover:text-[#0b4f86] disabled:opacity-30"
          title="Move up"
        >
          <ChevronUp size={15} />
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={last}
          className="p-1 text-gray-400 hover:text-[#0b4f86] disabled:opacity-30"
          title="Move down"
        >
          <ChevronDown size={15} />
        </button>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded shrink-0"
        title="Delete row"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}