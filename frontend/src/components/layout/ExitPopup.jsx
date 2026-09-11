import { useEffect, useState } from 'react';
import { X, CheckCircle2, Package, ShoppingCart } from 'lucide-react';
import { useSettings } from '../../store/settingsContext';

const FALLBACK_POPUP = {
  enabled: false,
  layout: 'showcase',
  badge: 'Best Seller',
  images: [],
  brand: 'Raftar',
  brandSub: 'FOOTWEAR',
  title: 'Wholesale Special',
  price: '',
  rating: '',
  reviews: '',
  description: '',
  features: [],
  packs: [],
  buttonText: 'Order Bulk Now',
  redirectUrl: '/shop',
};

const FEATURE_ICONS = [CheckCircle2, Package, ShoppingCart];

/**
 * Site popup – a product showcase design (gallery, features, pack selector)
 * or the simple title/message design. Controlled from Admin → Popups.
 */
export default function SitePopup() {
  const { settings } = useSettings();
  const [config, setConfig] = useState(null);
  const [show, setShow] = useState(false);
  const [mainIdx, setMainIdx] = useState(0);
  const [packIdx, setPackIdx] = useState(0);

  useEffect(() => {
    const key = 'raftar_popup_dismissed';
    // Only suppress for a short while after dismissal, so the popup can show again later.
    const RE_SHOW_AFTER = 10 * 60 * 1000; // 10 minutes
    const lastDismissed = Number(sessionStorage.getItem(key));
    if (lastDismissed && Date.now() - lastDismissed < RE_SHOW_AFTER) return;

    const apply = (c) => {
      if (c?.enabled) {
        setConfig({ ...FALLBACK_POPUP, ...c });
        const delay = Number(c.delayMs) || 2500;
        setTimeout(() => setShow(true), delay);
      }
    };

    apply(settings.popup || settings.exitPopup || null);
  }, [settings]);

  useEffect(() => {
    if (config) {
      setMainIdx(0);
      setPackIdx(0);
    }
  }, [config]);

  if (!show || !config?.enabled) return null;

  const dismiss = () => {
    setShow(false);
    sessionStorage.setItem('raftar_popup_dismissed', String(Date.now()));
  };

  const href = config.redirectUrl || config.link || '/shop';
  const images = (config.images || []).filter((i) => i && !i.startsWith('blob:'));
  const mainImage = images[mainIdx] || (config.image && !config.image.startsWith('blob:') ? config.image : '');

  const isShowcase = config.layout !== 'simple';

  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={dismiss} />

      {isShowcase ? (
        <div className="relative bg-white rounded-[20px] shadow-2xl overflow-y-auto max-h-[92vh] w-full max-w-[820px] grid sm:grid-cols-2 gap-8 p-6 sm:p-8">
          <button
            onClick={dismiss}
            aria-label="Close"
            className="absolute top-4 right-4 z-10 text-slate-400 hover:text-slate-800"
          >
            <X size={20} />
          </button>

          {/* Left column: gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-[#f8f6f0] rounded-2xl overflow-hidden">
              {config.badge && (
                <span className="absolute top-3.5 left-3.5 z-10 bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full">
                  ★ {config.badge}
                </span>
              )}
              {mainImage && (
                <img src={mainImage} alt={config.title || 'Offer'} className="w-full h-full object-cover" />
              )}
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2.5">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setMainIdx(i)}
                    className={`aspect-square bg-[#f8f6f0] rounded-[10px] overflow-hidden border-2 transition ${
                      i === mainIdx ? 'border-[#0b4f86]' : 'border-transparent'
                    }`}
                    aria-label={`View image ${i + 1}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right column: details */}
          <div className="flex flex-col min-w-0">
            <div className="font-serif italic font-bold text-xl text-slate-800 mb-0.5">
              {config.brand}
            </div>
            {config.brandSub && (
              <div className="text-[8px] tracking-[0.15em] uppercase text-slate-500 -mt-1 mb-4">
                {config.brandSub}
              </div>
            )}

            <h2 className="font-serif text-2xl text-slate-900 font-medium mb-1.5">{config.title}</h2>
            {config.price && <div className="text-xl font-extrabold text-[#0b4f86] mb-2">{config.price}</div>}

            {(config.rating || config.reviews) && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3.5">
                <span className="text-amber-500">{'★★★★★'}</span>
                {config.rating && <span>({config.rating})</span>}
                {config.reviews && <span>{config.reviews}</span>}
              </div>
            )}

            {config.description && (
              <p className="text-xs text-slate-500 leading-relaxed mb-5">{config.description}</p>
            )}

            {config.features?.length > 0 && (
              <div className="space-y-3.5 mb-6">
                {config.features.slice(0, 3).map((f, i) => {
                  const Icon = FEATURE_ICONS[i] || CheckCircle2;
                  return (
                    <div key={i} className="flex items-start gap-3">
                      <span className="w-8 h-8 shrink-0 bg-blue-50 rounded-full flex items-center justify-center text-[#0b4f86]">
                        <Icon size={16} />
                      </span>
                      <span>
                        <span className="block text-xs font-bold text-slate-800">{f.title}</span>
                        <span className="block text-[11px] text-slate-500">{f.text}</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {config.packs?.length > 0 && (
              <>
                <div className="text-xs font-bold text-slate-800 mb-2">Select Pack Size</div>
                <div className="grid grid-cols-2 gap-2.5 mb-4">
                  {config.packs.map((p, i) => (
                    <button
                      key={i}
                      onClick={() => setPackIdx(i)}
                      className={`rounded-lg px-3 py-2.5 text-center border transition ${
                        i === packIdx
                          ? 'bg-[#0b4f86] border-[#0b4f86] text-white'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <span className="block text-xs font-bold">{p.label}</span>
                      {p.sub && <span className="block text-[10px] opacity-80">{p.sub}</span>}
                    </button>
                  ))}
                </div>
              </>
            )}

            <a
              href={href}
              onClick={dismiss}
              target={href.startsWith('http') ? '_blank' : undefined}
              rel={href.startsWith('http') ? 'noreferrer' : undefined}
              className="flex items-center justify-center gap-2 w-full bg-[#0b4f86] hover:bg-[#0a365c] text-white py-3.5 rounded-lg text-sm font-bold transition"
            >
              <ShoppingCart size={18} /> {config.buttonText || 'Order Bulk Now'}
            </a>
            <button onClick={dismiss} className="block mx-auto mt-3 text-xs text-slate-400 hover:text-slate-600">
              No thanks
            </button>
          </div>
        </div>
      ) : (
        <div className="relative bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
          <button
            onClick={dismiss}
            className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-white/90 hover:bg-gray-100 shadow"
            aria-label="Close"
          >
            <X size={18} />
          </button>
          {mainImage && (
            <div className="aspect-[16/9] bg-gray-100">
              <img src={mainImage} alt="" className="w-full h-full object-cover" />
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
              target={href.startsWith('http') ? '_blank' : undefined}
              rel={href.startsWith('http') ? 'noreferrer' : undefined}
              className="inline-flex items-center justify-center w-full bg-[#0b4f86] hover:bg-[#083d6a] text-white py-3.5 rounded-xl text-sm font-semibold transition"
            >
              {config.buttonText || 'Shop Now'}
            </a>
            <button onClick={dismiss} className="mt-3 text-xs text-gray-400 hover:text-gray-600 underline">
              No thanks
            </button>
          </div>
        </div>
      )}
    </div>
  );
}