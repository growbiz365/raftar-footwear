import { useEffect, useState } from 'react';
import api from '../../services/api';
import { getLocalSettings, saveLocalSettings } from '../../data/catalog';
import ImageField from '../../components/admin/ImageField';
import { useToast } from '../../components/admin/Toast';

export default function AdminPopups() {
  const { toast } = useToast();
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState({
    enabled: false,
    title: 'Wholesale Special',
    message: 'Order bulk packs of 6 or 12 pairs and get dealer pricing. Contact us on WhatsApp!',
    buttonText: 'Order Bulk Now',
    redirectUrl: 'https://wa.me/923338788861',
    image: '',
    delayMs: 2500,
  });

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/admin/settings');
        const d = data.data || {};
        if (d.popup) setPopup((p) => ({ ...p, ...d.popup }));
        else if (d.exitPopup) {
          setPopup((p) => ({
            ...p,
            ...d.exitPopup,
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

  const save = async () => {
    setSaving(true);
    setMsg('');
    try {
      await api.put('/admin/settings/popup', { value: popup });
      setMsg('✓ Popup saved');
      toast('Popup saved');
    } catch {
      saveLocalSettings({ ...getLocalSettings(), popup });
      setMsg('✓ Saved locally (backend offline)');
      toast('Saved locally (backend offline)', 'info');
    }
    setSaving(false);
    setTimeout(() => setMsg(''), 3500);
  };

  if (loading) {
    return (
      <div className="p-6 max-w-6xl space-y-4">
        <div className="h-40 bg-gray-200 animate-pulse rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-6xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Site Popup</h1>
          <p className="text-sm text-gray-500 mt-1">
            Simple popup with optional image and redirect link. Shown once per browser session.
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

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <label className="flex items-center gap-3 text-sm font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={!!popup.enabled}
              onChange={(e) => setPopup({ ...popup, enabled: e.target.checked })}
              className="w-4 h-4 rounded accent-[#0b4f86]"
            />
            Enable popup on storefront
          </label>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              value={popup.title || ''}
              onChange={(e) => setPopup({ ...popup, title: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0b4f86]/20"
              placeholder="Popup title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea
              value={popup.message || ''}
              onChange={(e) => setPopup({ ...popup, message: e.target.value })}
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0b4f86]/20"
              placeholder="Short message"
            />
          </div>

          <ImageField
            label="Popup image (optional)"
            help="File upload or paste URL"
            value={popup.image || ''}
            onChange={(url) => setPopup({ ...popup, image: url })}
          />

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Button text</label>
              <input
                value={popup.buttonText || ''}
                onChange={(e) => setPopup({ ...popup, buttonText: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
                placeholder="Order Bulk Now"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Show after (milliseconds)</label>
              <input
                type="number"
                min={0}
                value={popup.delayMs ?? 2500}
                onChange={(e) => setPopup({ ...popup, delayMs: parseInt(e.target.value) || 0 })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Redirect link (button opens this)</label>
            <input
              value={popup.redirectUrl || ''}
              onChange={(e) => setPopup({ ...popup, redirectUrl: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
              placeholder="https://wa.me/923338788861 or /shop"
            />
            <p className="text-xs text-gray-400 mt-1">WhatsApp, /shop, or any full URL</p>
          </div>
        </div>

        {/* Live preview */}
        <div className="bg-slate-100 rounded-2xl p-5 sm:p-8 flex items-center justify-center min-h-[320px]">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-xl overflow-hidden">
            {popup.image && !popup.image.startsWith('blob:') && (
              <div className="aspect-[16/9] bg-gray-100">
                <img src={popup.image} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-6 text-center">
              <h3 className="text-lg font-display font-medium mb-2">{popup.title || 'Title'}</h3>
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                {popup.message || 'Message preview'}
              </p>
              <div className="w-full bg-[#0b4f86] text-white py-3 rounded-xl text-sm font-semibold">
                {popup.buttonText || 'Button'}
              </div>
              <p className="mt-2 text-xs text-gray-400">Preview only</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
