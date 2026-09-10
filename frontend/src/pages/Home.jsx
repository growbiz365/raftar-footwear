import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, fetchCategories } from '../store/slices/productSlice';
import ProductCard from '../components/product/ProductCard';
import { ChevronLeft, ChevronRight, Truck, RotateCcw, Shield, Headphones } from 'lucide-react';
import api from '../services/api';
import { getLocalSettings, STATIC_SETTINGS } from '../data/catalog';

function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="aspect-square bg-gray-100 mb-3" />
      <div className="h-3 bg-gray-100 rounded w-3/4 mb-2" />
      <div className="h-3 bg-gray-100 rounded w-1/3" />
    </div>
  );
}

const TRUST = [
  { icon: Truck, title: 'Wholesale packs 1 · 6 · 12', text: 'Dealer-ready cartons' },
  { icon: Shield, title: 'PCU & PVC quality', text: 'Factory QC every batch' },
  { icon: RotateCcw, title: 'Easy reorders', text: 'WhatsApp restock anytime' },
  { icon: Headphones, title: 'Dealer support 03338788861', text: 'Call or chat' },
];

const BENEFITS = [
  'Wholesale packs 1 · 6 · 12',
  'PCU & PVC factory quality',
  '25% off on bulk first order',
  'Free delivery across Pakistan',
  '15 Days quality claim support',
  'Cash on delivery available',
];

export default function Home() {
  const dispatch = useDispatch();
  const { items: products, categories, loading } = useSelector((s) => s.products);
  const [settings, setSettings] = useState(null);
  const [heroIndex, setHeroIndex] = useState(0);
  const [tab, setTab] = useState('best');
  const [countdown, setCountdown] = useState({ d: 0, h: 0, m: 0, s: 0 });

  const countdownEndIso = settings?.saleCountdown?.endDate || null;

  useEffect(() => {
    const resolveTarget = () => {
      if (countdownEndIso) {
        const d = new Date(countdownEndIso);
        if (!isNaN(d.getTime())) return d;
      }
      // Fallback: sale ends ~90 days from now (demo consistency)
      const end = new Date();
      end.setDate(end.getDate() + 90);
      end.setHours(23, 59, 59, 0);
      return end;
    };
    const end = resolveTarget();
    const tick = () => {
      const diff = Math.max(0, end - Date.now());
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown({ d, h, m, s });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [countdownEndIso]);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
    api
      .get('/settings')
      .then((r) => setSettings(r.data?.data || getLocalSettings()))
      .catch(() => setSettings(getLocalSettings()));
  }, [dispatch]);

  const s = settings || STATIC_SETTINGS;
  const hero = s.hero || STATIC_SETTINGS.hero;

  // Hero images must always come from Cloudinary — never localhost paths
  const CLOUD_HERO_IMG =
    'https://res.cloudinary.com/dj5hgapcp/image/upload/raftar-footwear/Chappal/01/1.jpg';
  const heroImage = (img) =>
    img && !img.startsWith('/') && !img.startsWith('data:') ? img : CLOUD_HERO_IMG;

  const slides =
    Array.isArray(hero.slides) && hero.slides.length > 0
      ? hero.slides.map((sl) => ({ ...sl, image: heroImage(sl.image) }))
      : [
          {
            badge: hero.badge || 'PLASTIC FOOTWEAR MANUFACTURER',
            title: hero.title || 'Quality Plastic',
            titleLine2: hero.titleLine2 || 'Footwear',
            subtitle:
              hero.subtitle ||
              'Premium PCU & PVC chappals and slides for wholesalers, dealers & distributors across Pakistan.',
            buttonText: hero.buttonText || 'Shop Now',
            buttonLink: hero.buttonLink || '/shop',
            image: heroImage(hero.image),
            bgColor: hero.bgColor || '#faf7f5',
          },
        ];

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => setHeroIndex((i) => (i + 1) % slides.length), 5500);
    return () => clearInterval(t);
  }, [slides.length]);

  const current = slides[heroIndex] || slides[0];
  const list = Array.isArray(products) ? products : [];

  const promo = s.promoTiles || {};
  const promoEyebrow = promo.eyebrow || 'Big offers on your favorite! 💖';
  const promoTitle = promo.title || 'Where Style Meets Comfort';
  const promoDefaultTiles = [
    { title: "Women's Favorite Styles", subtitle: 'Upto 50% Off', cta: 'Shop Now', to: '/collections/women', img: 'https://res.cloudinary.com/dj5hgapcp/image/upload/raftar-footwear/Multiple/03/13.jpg' },
    { title: 'Say Hello To Slides', subtitle: 'Volume packs ready', cta: 'Shop Now', to: '/collections/slides', img: 'https://res.cloudinary.com/dj5hgapcp/image/upload/raftar-footwear/01/2.jpg' },
    { title: 'Big Buckle Styles', subtitle: 'Flat wholesale rates', cta: 'Shop Now', to: '/collections/raftar', img: 'https://res.cloudinary.com/dj5hgapcp/image/upload/raftar-footwear/Panjadara/03/7.jpg' },
    { title: 'Kids & Everyday', subtitle: 'Comfort first', cta: 'Shop Now', to: '/collections/children', img: 'https://res.cloudinary.com/dj5hgapcp/image/upload/raftar-footwear/05/1.jpg' },
  ];
  const tiles = Array.isArray(promo.tiles) && promo.tiles.length ? promo.tiles : promoDefaultTiles;

  const sale = s.saleCountdown || {};
  const saleBadge = sale.badge || 'Limited time';
  const saleTitle = sale.title || 'Biggest sale of the year';
  const saleSubtitle = sale.subtitle || 'Shop before time runs out. Up to 70% OFF wholesale packs';
  const saleCta = sale.buttonText || 'Shop Now';
  const saleLink = sale.buttonLink || '/shop';
  const saleBg = sale.bgImg || 'https://res.cloudinary.com/dj5hgapcp/image/upload/raftar-footwear/Chappal/02/5.jpg';

  const tdata = s.testimonials || {};
  const tEyebrow = tdata.eyebrow || 'Happy Clients';
  const tTitle = tdata.title || 'We Work To Keep Dealers Happy';
  const tItems = Array.isArray(tdata.items) && tdata.items.length
    ? tdata.items
    : [
        { quote: 'True to size and durable for daily wear. Our customers reorder the Raftar slides every season.', name: 'Cory', city: 'Lahore', role: 'Fashion retailer' },
        { quote: 'Comfortable, stylish and great margins. Superstar packs move fast — easy WhatsApp reorders.', name: 'Herman', city: 'Peshawar', role: 'Regional stockist' },
        { quote: 'Ordered bulk for our store. Quality PVC and on-time delivery across Pakistan. Highly recommend.', name: 'Kylie', city: 'Karachi', role: 'Footwear store' },
      ];
  const featured = list.filter((p) => p.featured);
  const best = (featured.length ? featured : list).slice(0, 8);
  const topRated = [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 8);
  const grid = tab === 'best' ? best : topRated;
  const cats = (categories?.length ? categories : []).slice(0, 6);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [loading]);

  return (
    <div className="bg-white">
      {/* HERO */}
      <section
        className="relative overflow-hidden transition-colors duration-700"
        style={{ backgroundColor: current.bgColor || '#faf7f5' }}
      >
        {current.image && (
          <img
            key={current.image}
            src={current.image}
            alt=""
            className="absolute inset-0 w-full h-full object-cover animate-fade-in"
            loading="eager"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20" />
        <div className="relative max-w-[1440px] mx-auto">
          <div className="min-h-[72vh] lg:min-h-[85vh] flex items-center">
            <div className="px-6 sm:px-10 lg:px-16 xl:px-20 py-12 lg:py-0 text-center lg:text-left max-w-2xl text-white">
              {current.badge && (
                <p className="text-[11px] tracking-[0.28em] uppercase text-white/70 mb-5 font-medium">
                  {current.badge}
                </p>
              )}
              <h1 className="font-display text-[2.75rem] sm:text-5xl md:text-6xl lg:text-[4.25rem] font-medium leading-[1.05] text-white">
                {current.title}
                {current.titleLine2 && (
                  <>
                    <br />
                    <span className="italic text-white">{current.titleLine2}</span>
                  </>
                )}
              </h1>
              <p className="mt-5 sm:mt-6 text-white/80 max-w-md mx-auto lg:mx-0 text-[15px] leading-relaxed">
                {current.subtitle}
              </p>
              <div className="mt-8 flex flex-wrap gap-3 justify-center lg:justify-start">
                <Link to={current.buttonLink || '/shop'} className="btn-black border border-white">
                  {current.buttonText || 'Shop Now'}
                </Link>
                <a
                  href="https://wa.me/923338788861"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center border border-white/50 text-white px-7 py-3.5 text-xs font-semibold tracking-[0.15em] uppercase hover:bg-white/10 transition"
                >
                  Order Bulk Now
                </a>
              </div>
            </div>
          </div>
        </div>
        {slides.length > 1 && (
          <>
            <button
              onClick={() => setHeroIndex((i) => (i - 1 + slides.length) % slides.length)}
              className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center hover:bg-white transition z-10"
              aria-label="Previous"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setHeroIndex((i) => (i + 1) % slides.length)}
              className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center hover:bg-white transition z-10"
              aria-label="Next"
            >
              <ChevronRight size={18} />
            </button>
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-10">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setHeroIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === heroIndex ? 'w-8 bg-white' : 'w-1.5 bg-white/40'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* Categories — circular cards with nav arrows */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-16 sm:py-24">
        <div className="text-center mb-12 reveal">
          <p className="section-eyebrow">Browse</p>
          <h2 className="section-title">Shop By Categories</h2>
          <p className="text-gray-500 text-sm mt-2">Best brands on offer for wholesale partners</p>
        </div>
        {loading && !cats.length ? (
          <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="relative reveal" style={{ transitionDelay: '80ms' }}>
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('cat-scroll');
                if (el) el.scrollBy({ left: -280, behavior: 'smooth' });
              }}
              className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 w-10 h-10 rounded-full bg-white shadow-md border border-gray-100 items-center justify-center hover:bg-gray-50 transition"
              aria-label="Previous categories"
            >
              <ChevronLeft size={18} />
            </button>
            <div
              id="cat-scroll"
              className="flex gap-6 sm:gap-8 lg:gap-12 overflow-x-auto scrollbar-hide px-2 py-2 justify-start md:justify-center scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {(cats.length
                ? cats
                : [
                    { name: 'Men', slug: 'men', image: '' },
                    { name: 'Women', slug: 'women', image: '' },
                    { name: 'Children', slug: 'children', image: '' },
                    { name: 'Slides', slug: 'slides', image: '' },
                    { name: 'Raftar', slug: 'raftar', image: '' },
                    { name: 'Superstar', slug: 'superstar', image: '' },
                  ]
              ).map((cat) => (
                <Link
                  key={cat.slug || cat._id}
                  to={`/collections/${cat.slug}`}
                  className="cat-card group shrink-0"
                >
                  <div className="cat-circle">
                    {cat.image ? <img src={cat.image} alt={cat.name} loading="lazy" /> : <span className="cat-initial">{cat.name[0]}</span>}
                  </div>
                  <span className="cat-label">{cat.name}</span>
                </Link>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('cat-scroll');
                if (el) el.scrollBy({ left: 280, behavior: 'smooth' });
              }}
              className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 w-10 h-10 rounded-full bg-white shadow-md border border-gray-100 items-center justify-center hover:bg-gray-50 transition"
              aria-label="Next categories"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </section>

      {/* Best Seller tabs */}
      <section className="bg-[var(--rev-cream)] py-16 sm:py-24">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="text-center mb-10 reveal">
            <p className="section-eyebrow">Your Shoe-drobe Refresh Starts Now</p>
            <h2 className="section-title">Shop the most popular items currently trending</h2>
          </div>
          <div className="reveal" style={{ transitionDelay: '60ms' }}>
          <div className="flex justify-center gap-6 mb-10 border-b border-gray-200">
            {[
              { id: 'best', label: 'Best Seller' },
              { id: 'rated', label: 'Top Rated' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`pb-3 text-sm font-semibold tracking-wide transition relative ${
                  tab === t.id ? 'text-black' : 'text-gray-400 hover:text-gray-700'
                }`}
              >
                {t.label}
                {tab === t.id && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />}
              </button>
            ))}
          </div>
          {loading && list.length === 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {[1, 2, 3, 4].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {grid.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
          <div className="text-center mt-10">
            <Link to="/shop" className="btn-outline">
              Explore All
            </Link>
          </div>
          </div>
        </div>
      </section>

      {/* Trust / benefits strip — after Explore All (Revone style) */}
      <div className="bg-black overflow-hidden py-4">
        <div className="flex animate-marquee whitespace-nowrap text-[15px] sm:text-lg font-semibold tracking-wide text-white">
          {[...BENEFITS, ...BENEFITS, ...BENEFITS].map((b, i) => (
            <span key={i} className="mx-8 sm:mx-12 inline-flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-white/60 shrink-0" />
              {b}
            </span>
          ))}
        </div>
      </div>

      {/* Dual banners — matching Revone layout & heights */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-12 sm:py-20">
        <div className="grid md:grid-cols-2 gap-4 sm:gap-6 reveal">
          <Link
            to="/collections/women"
            className="group relative min-h-[320px] sm:min-h-[420px] lg:min-h-[480px] overflow-hidden bg-slate-900"
          >
            <img
              src="https://res.cloudinary.com/dj5hgapcp/image/upload/raftar-footwear/Chappali%20Boot/06/1.jpg"
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
            <div className="relative z-10 h-full flex flex-col justify-end p-6 sm:p-10 text-white">
              <p className="text-[11px] tracking-[0.22em] uppercase text-white/70 mb-2">Market Crash Prices!</p>
              <h3 className="font-display text-3xl sm:text-4xl lg:text-5xl font-medium mb-5 leading-[1.1]">
                Step Into The
                <br />
                Extraordinary
              </h3>
              <span className="inline-flex text-xs font-semibold tracking-[0.15em] uppercase border-b border-white pb-1 w-fit group-hover:border-rose-300 transition">
                Shop Women
              </span>
            </div>
          </Link>
          <Link
            to="/collections/men"
            className="group relative min-h-[320px] sm:min-h-[420px] lg:min-h-[480px] overflow-hidden bg-slate-800"
          >
            <img
              src="https://res.cloudinary.com/dj5hgapcp/image/upload/raftar-footwear/Boot/04/6.jpg"
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
            <div className="relative z-10 h-full flex flex-col justify-end p-6 sm:p-10 text-white">
              <p className="text-[11px] tracking-[0.22em] uppercase text-white/70 mb-2">All time Best Seller</p>
              <h3 className="font-display text-3xl sm:text-4xl lg:text-5xl font-medium mb-5 leading-[1.1]">
                Style That
                <br />
                Moves You First
              </h3>
              <span className="inline-flex text-xs font-semibold tracking-[0.15em] uppercase border-b border-white pb-1 w-fit group-hover:border-rose-300 transition">
                Shop Men
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* 4 promo tiles — Big offers */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 pb-16 sm:pb-24">
        <div className="text-center mb-10 sm:mb-12 reveal">
          <p className="section-eyebrow">{promoEyebrow}</p>
          <h2 className="section-title">{promoTitle}</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 reveal" style={{ transitionDelay: '80ms' }}>
{tiles.map((tile) => (
            <Link
              key={tile.title}
              to={tile.to}
              className="group relative aspect-[3/4] overflow-hidden bg-[#f0ebe6]"
            >
              <img
                src={tile.img}
                alt={tile.title}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
              <div className="relative z-10 h-full flex flex-col justify-end p-4 sm:p-6 text-white">
                <h3 className="font-display text-xl sm:text-2xl font-medium leading-tight mb-1">
                  {tile.title}
                </h3>
                <p className="text-[11px] sm:text-xs tracking-wide text-white/80 mb-3">{tile.subtitle}</p>
                <span className="text-[10px] sm:text-[11px] font-semibold tracking-[0.15em] uppercase border-b border-white/80 pb-0.5 w-fit group-hover:border-white transition">
                  {tile.cta}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Biggest sale + countdown — Revone style */}
      <section className="relative py-20 sm:py-28 overflow-hidden bg-slate-950 text-white text-center px-4">
        <img
          src={saleBg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/70 to-black/80" />
        <div className="relative z-10 max-w-3xl mx-auto reveal">
          <p className="text-[11px] tracking-[0.28em] uppercase text-white/60 mb-3">{saleBadge}</p>
          <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl font-medium mb-3 leading-tight">
            {saleTitle}
          </h2>
          <p className="text-white/70 text-sm sm:text-base mb-8">
            {saleSubtitle}
          </p>
          <div className="flex justify-center gap-3 sm:gap-5 mb-10">
            {[
              { v: countdown.d, l: 'Days' },
              { v: countdown.h, l: 'Hrs' },
              { v: countdown.m, l: 'Min' },
              { v: countdown.s, l: 'Sec' },
            ].map((u) => (
              <div
                key={u.l}
                className="w-16 h-16 sm:w-20 sm:h-20 bg-white/10 border border-white/15 flex flex-col items-center justify-center backdrop-blur-md"
              >
                <span className="font-display text-2xl sm:text-3xl font-medium tabular-nums text-white">
                  {String(u.v).padStart(2, '0')}
                </span>
                <span className="text-[9px] sm:text-[10px] tracking-[0.15em] uppercase text-white/50 mt-0.5">
                  {u.l}
                </span>
              </div>
            ))}
          </div>
          <Link to={saleLink} className="btn-black border border-white hover:bg-white hover:text-black">
            {saleCta}
          </Link>
        </div>
      </section>

      {/* Testimonials — Happy Clients */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-16 sm:py-24">
        <div className="text-center mb-12 reveal">
          <p className="section-eyebrow">{tEyebrow}</p>
          <h2 className="section-title">{tTitle}</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 reveal" style={{ transitionDelay: '80ms' }}>
          {tItems.map((t, idx) => {
            const person = t.name || '';
            const city = t.city && !String(person).includes(t.city) ? ` · ${t.city}` : '';
            return (
            <div
              key={idx}
              className="bg-[var(--rev-cream)] p-6 sm:p-8 border border-transparent hover:border-gray-200 transition flex flex-col"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-14 h-14 rounded-full bg-[#f0ebe6] flex items-center justify-center text-lg font-bold text-slate-700 shrink-0 overflow-hidden">
                  {t.img ? (
                    <img src={t.img} alt="" className="w-full h-full object-cover" />
                  ) : (
                    (person[0] || '?').toUpperCase()
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold tracking-wider uppercase text-slate-900">{person}{city}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{t.role || ''}</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed italic flex-1">“{t.quote || ''}”</p>
            </div>
          );
          })}
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-black text-white py-16 sm:py-20 text-center px-4 relative overflow-hidden">
        <img
          src="https://res.cloudinary.com/dj5hgapcp/image/upload/raftar-footwear/Boot/02/1.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-25"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 reveal">
        <h2 className="font-display text-2xl sm:text-4xl font-medium mb-3">
          Need Bulk Plastic Footwear?
        </h2>
        <p className="text-white/60 text-sm max-w-lg mx-auto mb-7">
          Raftar Footwear Enterprises · Peshawar · PCU &amp; PVC for wholesalers and distributors
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <a
            href="https://wa.me/923338788861"
            target="_blank"
            rel="noreferrer"
            className="btn-black border border-white hover:bg-white hover:text-black"
          >
            Order Bulk Now
          </a>
          <a
            href="tel:03338788861"
            className="inline-flex items-center justify-center border border-white/30 px-7 py-3.5 text-xs font-semibold tracking-[0.15em] uppercase hover:bg-white/10 transition"
          >
            03338788861
          </a>
        </div>
        </div>
      </section>
    </div>
  );
}
