import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import api from '../../services/api';
import { getLocalSettings } from '../../data/catalog';

/**
 * Simple site popup – title, message, optional image, CTA with redirect link.
 * Controlled from Admin → Popups.
 */
export default function SitePopup() {
  const [config, setConfig] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const key = 'raftar_popup_dismissed';
    // Only suppress for a short while after dismissal, so the popup can show again later.
    const RE_SHOW_AFTER = 10 * 60 * 1000; // 10 minutes
    const lastDismissed = Number(sessionStorage.getItem(key));
    if (lastDismissed && Date.now() - lastDismissed < RE_SHOW_AFTER) return;

    const apply = (c) => {
      if (c?.enabled) {
        setConfig(c);
        const delay = Number(c.delayMs) || 2500;
        setTimeout(() => setShow(true), delay);
      }
    };

    api
      .get('/settings')
      .then((r) => {
        const d = r.data?.data || {};
        apply(d.popup || d.exitPopup || null);
      })
      .catch(() => {
        const local = getLocalSettings();
        apply(local.popup || null);
      });
  }, []);

  if (!show || !config?.enabled) return null;

  const dismiss = () => {
    setShow(false);
    sessionStorage.setItem('raftar_popup_dismissed', String(Date.now()));
  };

  const href = config.redirectUrl || config.link || '/shop';
  const imgSrc = config.image && !config.image.startsWith('blob:') ? config.image : '';

  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={dismiss} />
      <div className="relative bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-white/90 hover:bg-gray-100 shadow"
          aria-label="Close"
        >
          <X size={18} />
        </button>
        {imgSrc && (
          <div className="aspect-[16/9] bg-gray-100">
            <img src={imgSrc} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="p-6 sm:p-8 text-center">
          <h2 className="text-xl sm:text-2xl font-display font-medium mb-2">
            {config.title || 'Special Offer'}
          </h2>
          {config.message && (
            <p className="text-gray-600 text-sm mb-5 leading-relaxed">{config.message}</p>
          )}
          <a
            href={href}
            onClick={dismiss}
            className="inline-flex items-center justify-center w-full bg-[#0b4f86] hover:bg-[#083d6a] text-white py-3.5 rounded-xl text-sm font-semibold transition"
          >
            {config.buttonText || 'Shop Now'}
          </a>
          <button onClick={dismiss} className="mt-3 text-xs text-gray-400 hover:text-gray-600 underline">
            No thanks
          </button>
        </div>
      </div>
    </div>
  );
}
