import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Plus, Trash2, X, Pencil, Save, ChevronUp, ChevronDown, RotateCcw } from 'lucide-react';
import { getLocalSettings, saveLocalSettings, STATIC_SETTINGS } from '../../data/catalog';
import ImageField from '../../components/admin/ImageField';
import { useToast } from '../../components/admin/Toast';

const emptySlide = {
  badge: 'PLASTIC FOOTWEAR MANUFACTURER',
  title: 'Quality Plastic',
  titleLine2: 'Footwear in Peshawar',
  subtitle: 'Premium PCU & PVC for wholesalers and dealers.',
  buttonText: 'Explore Products',
  buttonLink: '/shop',
  image: '',
  bgMode: 'keep',
  bgColor: '',
};

const normalizeSlide = (s) => ({
  ...emptySlide,
  ...s,
  bgMode: s?.bgMode || (s?.bgColor ? 'custom' : 'keep'),
});

export default function AdminSettings() {
  const { toast, confirm } = useToast();
  const [promoBar, setPromoBar] = useState('');
  const [slides, setSlides] = useState([{ ...emptySlide, image: '' }]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [draft, setDraft] = useState({ ...emptySlide });
  const [selected, setSelected] = useState(new Set());

  const updraft = (k, v) => setDraft((d) => ({ ...d, [k]: v }));

  const openAdd = () => {
    setDraft({ ...emptySlide });
    setModal({ mode: 'add' });
  };

  const openEdit = (slide, index) => {
    setDraft(normalizeSlide({ ...emptySlide, ...slide }));
    setModal({ mode: 'edit', index });
  };

  const saveSlide = () => {
    const isEdit = modal?.mode === 'edit';
    const s = normalizeSlide({ ...emptySlide, ...draft });
    if (isEdit) {
      setSlides((arr) => arr.map((x, idx) => (idx === modal.index ? s : x)));
    } else {
      setSlides((arr) => [...arr, s]);
    }
    setModal(null);
    setDraft({ ...emptySlide });
    toast(isEdit ? 'Hero slide updated' : 'Hero slide added');
  };

  const removeSlide = async (i) => {
    const ok = await confirm('Remove this hero slide?');
    if (!ok) return;
    setSlides((s) => s.filter((_, idx) => idx !== i));
    setSelected((prev) => {
      const next = new Set();
      prev.forEach((x) => next.add(x > i ? x - 1 : x));
      next.delete(i);
      return next;
    });
    toast('Hero slide removed');
  };

  const removeSelectedSlides = async () => {
    if (selected.size === 0) return;
    const ok = await confirm(`Remove ${selected.size} selected hero slide(s)?`);
    if (!ok) return;
    setSlides((s) => s.filter((_, idx) => !selected.has(idx)));
    setSelected(new Set());
    toast(`${selected.size} hero slide(s) removed`);
  };

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/admin/settings');
        const d = data.data || {};
        setPromoBar(typeof d.promoBar === 'string' ? d.promoBar : d.promoBar || '');
        const h = d.hero || {};
        if (Array.isArray(h.slides) && h.slides.length) setSlides(h.slides.map(normalizeSlide));
        else if (h.image || h.title) setSlides([normalizeSlide({ ...emptySlide, ...h })]);
      } catch {
        const local = getLocalSettings();
        setPromoBar(local.promoBar || '');
        const h = local.hero || {};
        if (Array.isArray(h.slides) && h.slides.length) setSlides(h.slides.map(normalizeSlide));
        else setSlides([normalizeSlide({ ...emptySlide, ...h, image: h.image || '' })]);
      }
      setLoading(false);
    })();
  }, []);

  const moveSlide = (i, dir) => {
    setSlides((arr) => {
      const next = [...arr];
      const j = i + dir;
      if (j < 0 || j >= next.length) return arr;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };

  const save = async () => {
    setSaving(true);
    setMsg('');
    const cleanSlides = slides
      .filter((s) => s.image || s.title)
      .map((s) => (s.bgMode === 'custom' ? s : { ...s, bgColor: '' }));
    const hero = {
      ...(cleanSlides[0] || emptySlide),
      slides: cleanSlides,
    };
    try {
      await api.put('/admin/settings/promoBar', { value: promoBar });
      await api.put('/admin/settings/hero', { value: hero });
      setMsg('✓ Settings saved — refresh the storefront to see changes');
      toast('Settings saved — refresh the storefront');
    } catch {
      saveLocalSettings({ ...getLocalSettings(), promoBar, hero });
      setMsg('✓ Saved locally (backend offline). Storefront will use local data.');
      toast('Saved locally (backend offline)', 'info');
    }
    setSaving(false);
    setTimeout(() => setMsg(''), 4000);
  };

  const resetDefault = async () => {
    if (!(await confirm('Reset hero slider and promo bar to the website default design?'))) return;
    setSaving(true);
    setMsg('');
    const defaultSlides = STATIC_SETTINGS.hero.slides.map((s) => ({ ...s }));
    const defaultPromo = STATIC_SETTINGS.promoBar;
    setPromoBar(defaultPromo);
    setSlides(defaultSlides);
    try {
      await api.put('/admin/settings/promoBar', { value: defaultPromo });
      await api.put('/admin/settings/hero', {
        ...STATIC_SETTINGS.hero,
        slides: defaultSlides,
      });
      setMsg('✓ Restored the default design — refresh the storefront to see it');
      toast('Default design restored');
    } catch {
      saveLocalSettings({
        ...getLocalSettings(),
        promoBar: defaultPromo,
        hero: { ...STATIC_SETTINGS.hero, slides: defaultSlides },
      });
      setMsg('✓ Restored default locally (backend offline)');
      toast('Default restored locally', 'info');
    }
    setSaving(false);
    setTimeout(() => setMsg(''), 4000);
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-4 max-w-6xl">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-6xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Site Settings</h1>
          <p className="text-sm text-gray-500 mt-1">
            Promo bar &amp; hero slider — upload images by file or paste URL
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={resetDefault}
            disabled={saving}
            className="flex items-center gap-2 bg-white border border-gray-200 hover:border-[#0b4f86] text-[#0b4f86] px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60 shadow-sm"
            title="Restore the default hero slider & promo bar"
          >
            <RotateCcw size={15} /> Reset to default design
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="bg-[#0b4f86] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#083d6a] disabled:opacity-60 shadow-sm"
          >
            {saving ? 'Saving…' : 'Save all settings'}
          </button>
        </div>
      </div>

      {msg && (
        <div className="mb-5 text-sm bg-emerald-50 text-emerald-800 border border-emerald-100 px-4 py-3 rounded-xl">
          {msg}
        </div>
      )}

      {/* Promo bar */}
      <section className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 mb-6 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">Top promo bar</h2>
        <label className="block text-sm font-medium text-gray-700 mb-1">Text shown above the header</label>
        <input
          value={promoBar}
          onChange={(e) => setPromoBar(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#0b4f86]/20 focus:border-[#0b4f86]"
          placeholder="★ Quality Footwear · Wholesale packs 1 · 6 · 12"
        />
      </section>

      {/* Hero slides */}
      <section className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">Hero slider</h2>
            <p className="text-xs text-gray-500 mt-0.5">Add multiple slides — each can use file upload or image URL</p>
          </div>
          <button
            type="button"
            onClick={openAdd}
            className="flex items-center gap-1.5 bg-white border border-gray-200 hover:border-[#0b4f86] text-[#0b4f86] px-4 py-2 rounded-xl text-sm font-medium transition"
          >
            <Plus size={16} /> Add hero image / slide
          </button>
        </div>

        {selected.size > 0 && (
          <div className="flex items-center justify-between bg-rose-50 border border-rose-100 rounded-xl px-4 py-2.5 mb-3">
            <p className="text-sm text-rose-700 font-medium">{selected.size} selected</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setSelected(new Set())} className="px-3 py-1.5 text-sm text-gray-600 border rounded-lg bg-white hover:bg-gray-50">
                Clear
              </button>
              <button onClick={removeSelectedSlides} className="px-3 py-1.5 text-sm text-white bg-rose-600 rounded-lg hover:bg-rose-700">
                Remove selected
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 mb-3">
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={slides.length > 0 && slides.every((_, i) => selected.has(i))}
              onChange={(e) => {
                setSelected(e.target.checked ? new Set(slides.map((_, i) => i)) : new Set());
              }}
              className="accent-[#0b4f86]"
            />
            Select all slides
          </label>
        </div>

        <div className="space-y-4">
          {slides.map((slide, i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4"
            >
              <div className="flex items-center gap-3 shrink-0">
                <input
                  type="checkbox"
                  checked={selected.has(i)}
                  onChange={(e) => {
                    setSelected((prev) => {
                      const next = new Set(prev);
                      if (e.target.checked) next.add(i);
                      else next.delete(i);
                      return next;
                    });
                  }}
                  className="accent-rose-600"
                  title="Select slide"
                />
                <div className="relative w-full sm:w-44 h-28 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                {slide.image ? (
                  <img
                    src={slide.image}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No image</div>
                )}
              </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-base font-semibold text-slate-800">Slide {i + 1}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${slide.image || slide.title ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                    {slide.image || slide.title ? 'Active' : 'Empty'}
                  </span>
                </div>
                <p className="text-sm text-gray-800 mt-1 truncate">
                  {slide.title || 'Untitled'}{slide.titleLine2 ? ` — ${slide.titleLine2}` : ''}
                </p>
                {(slide.subtitle || slide.buttonText) && (
                  <p className="text-xs text-gray-400 mt-0.5 truncate">
                    {slide.subtitle || ''}
                    {slide.subtitle && slide.buttonText ? ' · ' : ''}
                    {slide.buttonText ? `Button: ${slide.buttonText}` : ''}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => moveSlide(i, -1)}
                  disabled={i === 0}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"
                  title="Move up"
                >
                  <ChevronUp size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => moveSlide(i, 1)}
                  disabled={i === slides.length - 1}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"
                  title="Move down"
                >
                  <ChevronDown size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => openEdit(slide, i)}
                  className="p-2 rounded-lg bg-[#0b4f86]/10 text-[#0b4f86] hover:bg-[#0b4f86]/20"
                  title="Edit slide"
                >
                  <Pencil size={15} />
                </button>
                {slides.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSlide(i)}
                    className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 ml-1"
                    title="Remove slide"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
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

      {modal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white z-10">
              <h2 className="text-lg font-semibold">{modal?.mode === 'edit' ? 'Edit hero slide' : 'Add hero slide'}</h2>
              <button onClick={() => setModal(null)} className="p-1 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 grid lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <ImageField
                  label="Hero image (file upload or URL)"
                  help="Recommended: wide product/factory photo"
                  value={draft.image || ''}
                  onChange={(url) => updraft('image', url)}
                />
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Badge (small label)</label>
                    <input
                      value={draft.badge || ''}
                      onChange={(e) => updraft('badge', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm"
                      placeholder="PLASTIC FOOTWEAR"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Background</label>
                    <div className="flex items-center gap-2">
                      <label className={`flex items-center gap-1.5 text-xs px-2.5 py-2 rounded-lg border cursor-pointer ${(draft.bgMode || 'keep') === 'keep' ? 'border-[#0b4f86] bg-blue-50 text-[#0b4f86]' : 'border-gray-200'}`}>
                        <input
                          type="radio"
                          name="new-bg-mode"
                          checked={(draft.bgMode || 'keep') === 'keep'}
                          onChange={() => updraft('bgMode', 'keep')}
                          className="accent-[#0b4f86]"
                        />
                        Keep styling
                      </label>
                      <label className={`flex items-center gap-1.5 text-xs px-2.5 py-2 rounded-lg border cursor-pointer ${draft.bgMode === 'custom' ? 'border-[#0b4f86] bg-blue-50 text-[#0b4f86]' : 'border-gray-200'}`}>
                        <input
                          type="radio"
                          name="new-bg-mode"
                          checked={draft.bgMode === 'custom'}
                          onChange={() => updraft('bgMode', 'custom')}
                          className="accent-[#0b4f86]"
                        />
                        New color
                      </label>
                      {draft.bgMode === 'custom' && (
                        <input
                          type="color"
                          value={draft.bgColor || '#f0f7fc'}
                          onChange={(e) => updraft('bgColor', e.target.value)}
                          className="h-9 w-12 border rounded cursor-pointer"
                        />
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Title (line 1)</label>
                  <input
                    value={draft.title || ''}
                    onChange={(e) => updraft('title', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Title (line 2, accent color)</label>
                  <input
                    value={draft.titleLine2 || ''}
                    onChange={(e) => updraft('titleLine2', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Subtitle</label>
                  <textarea
                    value={draft.subtitle || ''}
                    onChange={(e) => updraft('subtitle', e.target.value)}
                    rows={2}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Button text</label>
                    <input
                      value={draft.buttonText || ''}
                      onChange={(e) => updraft('buttonText', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Button link</label>
                    <input
                      value={draft.buttonLink || ''}
                      onChange={(e) => updraft('buttonLink', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm"
                      placeholder="/shop or https://..."
                    />
                  </div>
                </div>
              </div>

              <div className="lg:sticky lg:top-0 self-start">
                <p className="text-xs font-medium text-gray-500 mb-2">Live preview</p>
                <div
                  className="relative rounded-2xl overflow-hidden min-h-[220px] flex items-center"
                  style={{ background: (draft.bgMode || 'keep') === 'custom' ? draft.bgColor || '#f0f7fc' : 'linear-gradient(120deg,#f0f7fc,#e6f1f9)' }}
                >
                  {draft.image && (
                    <img
                      src={draft.image}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  )}
                  {!draft.image && (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                      <div className="text-center">
                        <p className="text-xs mb-1">No image — text-only slide</p>
                      </div>
                    </div>
                  )}
                  <div className="relative p-6 max-w-md">
                    {(draft.badge || '') && <p className="text-[10px] font-semibold tracking-widest text-[#0b4f86] mb-2 uppercase">{draft.badge}</p>}
                    <h3 className="text-2xl font-bold text-[#0b4f86] leading-tight">{draft.title || 'Slide Title'}</h3>
                    <p className="text-2xl font-bold text-gray-800 leading-tight">{draft.titleLine2 || ''}</p>
                    {(draft.subtitle || '') && <p className="text-xs text-gray-500 mt-2">{draft.subtitle}</p>}
                    {(draft.buttonText || '') && (
                      <div className="mt-3 inline-flex items-center gap-1 bg-[#0b4f86] text-white text-xs px-3.5 py-2 rounded-lg">
                        {draft.buttonText}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t sticky bottom-0 bg-white">
              <button onClick={() => setModal(null)} className="px-4 py-2.5 text-sm border rounded-xl hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={saveSlide} className="flex items-center gap-2 bg-[#0b4f86] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#083d6a]">
                <Save size={16} /> {modal?.mode === 'edit' ? 'Save changes' : 'Add slide'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
