import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, fetchCategories } from '../store/slices/productSlice';
import ProductCard from '../components/product/ProductCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../services/api';
import { getLocalSettings, STATIC_SETTINGS, IMG } from '../data/catalog';

function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/4] bg-gray-200 rounded-lg mb-3" />
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-1/3" />
    </div>
  );
}

export default function Home() {
  const dispatch = useDispatch();
  const { items: products, categories, loading } = useSelector((s) => s.products);
  const [settings, setSettings] = useState(null);
  const [heroIndex, setHeroIndex] = useState(0);

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

  // Support multiple hero slides: hero.slides[] or single hero.image
  const slides =
    Array.isArray(hero.slides) && hero.slides.length > 0
      ? hero.slides
      : [
          {
            badge: hero.badge,
            title: hero.title,
            titleLine2: hero.titleLine2,
            subtitle: hero.subtitle,
            buttonText: hero.buttonText || 'Explore Products',
            buttonLink: hero.buttonLink || '/shop',
            image: hero.image || IMG.hero,
            bgColor: hero.bgColor || '#f0f7fc',
          },
        ];

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => setHeroIndex((i) => (i + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides.length]);

  const current = slides[heroIndex] || slides[0];

  const list = Array.isArray(products) ? products : [];
  const topSellers = list.filter((p) => p.featured).slice(0, 8);
  const mayAlsoLike = list.slice(0, 5);

  return (
    <div>
      {/* HERO SLIDER */}
      <section
        className="relative overflow-hidden transition-colors duration-500"
        style={{ backgroundColor: current.bgColor || '#f0f7fc' }}
      >
        {slides.length > 1 && (
          <>
            <button
              onClick={() => setHeroIndex((i) => (i - 1 + slides.length) % slides.length)}
              className="absolute left-2 sm:left-4 md:left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white z-20"
              aria-label="Previous"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => setHeroIndex((i) => (i + 1) % slides.length)}
              className="absolute right-2 sm:right-4 md:right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white z-20"
              aria-label="Next"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 items-center min-h-[60vh] sm:min-h-[70vh] lg:min-h-[78vh] py-10 lg:py-0">
            <div className="order-2 lg:order-1 text-center lg:text-left relative z-10">
              <p className="text-[10px] sm:text-xs tracking-[0.2em] text-gray-500 mb-3 sm:mb-4 uppercase">
                {current.badge}
              </p>
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium leading-[1.1] text-slate-900">
                {current.title}
                {current.titleLine2 && (
                  <>
                    <br />
                    <span className="text-[#0b4f86]">{current.titleLine2}</span>
                  </>
                )}
              </h1>
              <p className="mt-4 sm:mt-6 text-gray-600 max-w-md mx-auto lg:mx-0 text-sm sm:text-base leading-relaxed">
                {current.subtitle}
              </p>
              <div className="mt-6 sm:mt-8 flex flex-wrap gap-3 justify-center lg:justify-start">
                <Link
                  to={current.buttonLink || '/shop'}
                  className="inline-flex bg-[#0b4f86] text-white px-7 py-3.5 rounded-xl text-sm font-semibold hover:bg-[#083d6a] transition shadow-lg shadow-blue-200"
                >
                  {current.buttonText || 'Explore Products'}
                </Link>
                <a
                  href="https://wa.me/923338788861"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex border-2 border-[#0b4f86] text-[#0b4f86] px-7 py-3.5 rounded-xl text-sm font-semibold hover:bg-blue-50 transition"
                >
                  Order Bulk Now
                </a>
              </div>
            </div>
            <div className="order-1 lg:order-2 relative">
              <div className="max-h-[520px] mx-auto overflow-hidden rounded-2xl">
                <img
                  key={current.image}
                  src={current.image}
                  alt=""
                  className="w-full h-full object-contain animate-[fadeIn_0.5s_ease]"
                  loading="eager"
                />
              </div>
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setHeroIndex(i)}
                    className={`w-2.5 h-2.5 rounded-full transition ${
                      i === heroIndex ? 'bg-[#0b4f86] scale-110' : 'bg-white/70'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <h2 className="font-display text-2xl sm:text-3xl font-medium text-center mb-8">Shop by Category</h2>
        {loading && !categories?.length ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square bg-gray-200 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(categories?.length ? categories : []).slice(0, 4).map((cat) => (
              <Link
                key={cat._id || cat.slug}
                to={`/collections/${cat.slug}`}
                className="group relative aspect-square overflow-hidden rounded-xl bg-gray-100"
              >
                {cat.image && (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                  <span className="text-white font-semibold text-sm sm:text-base">{cat.name}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Featured */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs tracking-widest text-gray-400 uppercase mb-1">Wholesale Ready</p>
            <h2 className="font-display text-2xl sm:text-3xl font-medium">Featured Products</h2>
          </div>
          <Link to="/shop" className="text-sm font-medium text-[#0b4f86] hover:underline hidden sm:block">
            View all →
          </Link>
        </div>
        {loading && list.length === 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {(topSellers.length ? topSellers : list.slice(0, 8)).map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Brand bands */}
      <section className="bg-slate-900 text-white py-14 sm:py-20 my-8">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-8">
          <Link
            to="/collections/raftar"
            className="group block p-8 sm:p-10 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
          >
            <p className="text-xs tracking-widest uppercase text-white/50 mb-2">Brand</p>
            <h3 className="font-display text-3xl mb-3">Raftar Footwear</h3>
            <p className="text-white/70 text-sm mb-4">Premium PCU & PVC slides and chappals for dealers.</p>
            <span className="text-sm font-semibold group-hover:underline">Shop Raftar →</span>
          </Link>
          <Link
            to="/collections/superstar"
            className="group block p-8 sm:p-10 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
          >
            <p className="text-xs tracking-widest uppercase text-white/50 mb-2">Brand</p>
            <h3 className="font-display text-3xl mb-3">Superstar Footwear</h3>
            <p className="text-white/70 text-sm mb-4">Sports & everyday slides built for volume orders.</p>
            <span className="text-sm font-semibold group-hover:underline">Shop Superstar →</span>
          </Link>
        </div>
      </section>

      {/* More products */}
      {mayAlsoLike.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="font-display text-2xl sm:text-3xl font-medium mb-8 text-center">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {mayAlsoLike.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-[#0b4f86] text-white py-14 text-center px-4">
        <h2 className="font-display text-2xl sm:text-3xl font-medium mb-3">Need Bulk Orders?</h2>
        <p className="text-white/80 text-sm max-w-lg mx-auto mb-6">
          Pack sizes 1, 6 & 12 pairs. Call or WhatsApp for dealer rates.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <a
            href="https://wa.me/923338788861"
            target="_blank"
            rel="noreferrer"
            className="bg-white text-[#0b4f86] px-6 py-3 rounded-xl text-sm font-bold hover:bg-gray-100"
          >
            Order Bulk Now
          </a>
          <a
            href="tel:03338788861"
            className="border border-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-white/10"
          >
            03338788861
          </a>
        </div>
      </section>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0.6; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
