import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Heart, ShoppingBag, Menu, X, ChevronDown, Phone } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { setCartOpen, setSearchOpen, selectCartCount } from '../../store/slices/cartSlice';
import { useSettings } from '../../store/settingsContext';
import api from '../../services/api';

// Matches the live dashboard logo so the first paint shows the correct brand
// before /settings resolves (instead of flashing an old/blank logo).
const LOGO =
  'https://res.cloudinary.com/dj5hgapcp/image/upload/v1789020694/revone/r5tazrzc2ztsb5xyqtly.jpg';
const PHONE = '03338788861';
const PROMO = 'GET FLAT WHOLESALE RATES · PACKS 1 · 6 · 12 · CALL ' + PHONE;

export default function Header() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const cartCount = useSelector(selectCartCount);
  const wishlist = useSelector((s) => s.cart.wishlist);
  const isSearchOpen = useSelector((s) => s.cart.isSearchOpen);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [allProducts, setAllProducts] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);

  const logo =
    typeof settings?.logo === 'string' && settings.logo && !settings.logo.includes('/uploads/')
      ? settings.logo
      : LOGO;
  const promoBar =
    typeof settings?.promoBar === 'string' && settings.promoBar
      ? settings.promoBar
      : typeof settings?.promoBar === 'object' && settings.promoBar?.text
        ? settings.promoBar.text
        : PROMO;

  useEffect(() => {
    if (!isSearchOpen) return;
    setSearchQuery('');
    api
      .get('/products', { params: { limit: 200 } })
      .then((r) => setAllProducts(r.data?.data || r.data || []))
      .catch(() => setAllProducts([]));
  }, [isSearchOpen]);

  const goToSearch = (value) => {
    if (!value.trim()) return;
    navigate(`/shop?q=${encodeURIComponent(value)}`);
    dispatch(setSearchOpen(false));
  };

  const q = searchQuery.trim().toLowerCase();
  const suggestions = q
    ? allProducts
        .filter(
          (p) =>
            (p.name || '').toLowerCase().includes(q) ||
            (p.article || '').toLowerCase().includes(q) ||
            (p.colors || []).some((c) => String(c).toLowerCase().includes(q))
        )
        .slice(0, 6)
    : [];
  const productImg = (p) =>
    p.image || p.colorVariants?.[0]?.image || p.images?.[0] || '/images/product-1.svg';

  useEffect(() => {
    setMobileMenu(false);
    setOpenDropdown(null);
  }, [location.pathname]);

  useEffect(() => {
    const close = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpenDropdown(null);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const shopLinks = [
    { to: '/shop', label: 'All Products' },
    { to: '/collections/men', label: 'Men' },
    { to: '/collections/women', label: 'Women' },
    { to: '/collections/children', label: 'Children' },
    { to: '/collections/raftar', label: 'Raftar Footwear' },
    { to: '/collections/superstar', label: 'Superstar Footwear' },
  ];

  const navClass = (path) => {
    const active = location.pathname === path || location.pathname.startsWith(path + '/');
    return `relative py-5 text-[13px] font-medium tracking-wide transition-colors ${
      active ? 'text-black' : 'text-gray-600 hover:text-black'
    } after:absolute after:left-0 after:bottom-3 after:h-[2px] after:bg-black after:transition-all after:duration-300 ${
      active ? 'after:w-full' : 'after:w-0 hover:after:w-full'
    }`;
  };

  return (
    <>
      {/* Top promo bar — Revone black bar */}
      <div className="bg-black text-white text-[11px] sm:text-xs">
        <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-10 flex items-center justify-between gap-3 h-9">
          <a
            href={`tel:${PHONE}`}
            className="hidden sm:inline-flex items-center gap-1.5 text-white transition shrink-0 font-medium tracking-wide uppercase"
          >
            <Phone size={12} />
            Need Help? Call us at {PHONE}
          </a>
          <p className="flex-1 text-center font-medium tracking-wide uppercase truncate px-2">
            {promoBar}
          </p>
          <span className="hidden md:inline text-white shrink-0 font-medium tracking-wide uppercase">PKR</span>
        </div>
      </div>

      {/* Main header — white, clean */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100" ref={dropdownRef}>
        <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between h-[76px] sm:h-24 lg:h-24 gap-4">
            {/* Mobile menu */}
            <button
              className="lg:hidden p-2 -ml-1 text-gray-800"
              onClick={() => setMobileMenu(!mobileMenu)}
              aria-label="Menu"
            >
              {mobileMenu ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Logo */}
            <Link
              to="/"
              onClick={() => window.scrollTo(0, 0)}
              className="flex items-center shrink-0"
            >
              <img
                src={logo}
                alt="Raftar Footwear"
                className="h-14 sm:h-16 lg:h-20 w-auto object-contain max-w-[280px] sm:max-w-[320px] lg:max-w-[400px]"
                loading="eager"
                decoding="async"
              />
            </Link>

            {/* Desktop nav — center like Revone */}
            <nav className="hidden lg:flex items-center gap-6 xl:gap-8 flex-1 justify-center">
              <Link to="/" className={navClass('/')}>
                Home
              </Link>

              <div
                className="relative"
                onMouseEnter={() => setOpenDropdown('shop')}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <Link to="/shop" className={`${navClass('/shop')} inline-flex items-center gap-1`}>
                  Shop <ChevronDown size={13} className="opacity-60" />
                </Link>
                {openDropdown === 'shop' && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-0 w-52 bg-white shadow-xl border border-gray-100 py-2 z-50">
                    {shopLinks.map((l) => (
                      <Link
                        key={l.to}
                        to={l.to}
                        className="block px-4 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50 hover:text-black transition"
                        onClick={() => setOpenDropdown(null)}
                      >
                        {l.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link to="/collections/raftar" className={navClass('/collections/raftar')}>
                Raftar
              </Link>
              <Link to="/collections/superstar" className={navClass('/collections/superstar')}>
                Superstar
              </Link>
              <Link to="/blog" className={navClass('/blog')}>
                Blog
              </Link>
              <Link to="/about" className={navClass('/about')}>
                About
              </Link>
              <Link to="/contact" className={navClass('/contact')}>
                Contact
              </Link>
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <a
                href="https://wa.me/923338788861"
                target="_blank"
                rel="noreferrer"
                className="hidden lg:inline-flex items-center bg-black text-white text-xs font-semibold tracking-widest uppercase px-5 h-10 hover:bg-gray-800 transition"
              >
                Order Bulk Now
              </a>
              {/* Desktop search field */}
              <button
                onClick={() => dispatch(setSearchOpen(true))}
                className="hidden md:flex items-center gap-2 h-9 px-3 min-w-[160px] bg-gray-50 border border-gray-100 text-gray-400 text-xs hover:border-gray-200 transition"
              >
                <Search size={14} />
                <span>Search Products</span>
              </button>
              <button
                onClick={() => dispatch(setSearchOpen(true))}
                className="md:hidden p-2 text-gray-800 hover:opacity-70"
                aria-label="Search"
              >
                <Search size={18} />
              </button>
              <Link to="/wishlist" className="p-2 text-gray-800 hover:opacity-70 relative hidden sm:inline-flex">
                <Heart size={18} />
                {wishlist.length > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-black text-white text-[9px] min-w-[14px] h-[14px] rounded-full flex items-center justify-center px-0.5">
                    {wishlist.length}
                  </span>
                )}
              </Link>
              <button
                onClick={() => dispatch(setCartOpen(true))}
                className="p-2 text-gray-800 hover:opacity-70 relative"
                aria-label="Cart"
              >
                <ShoppingBag size={18} />
                {cartCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-black text-white text-[9px] min-w-[14px] h-[14px] rounded-full flex items-center justify-center px-0.5">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileMenu && (
          <div className="lg:hidden border-t border-gray-100 bg-white max-h-[80vh] overflow-y-auto">
            <nav className="flex flex-col p-4 gap-0.5 text-sm">
              {[
                ['/', 'Home'],
                ['/shop', 'Shop'],
                ['/collections/raftar', 'Raftar Footwear'],
                ['/collections/superstar', 'Superstar Footwear'],
                ['/blog', 'Blog'],
                ['/about', 'About'],
                ['/manufacturing', 'Manufacturing'],
                ['/contact', 'Contact'],
              ].map(([to, label]) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileMenu(false)}
                  className="py-3 border-b border-gray-50 font-medium text-gray-800"
                >
                  {label}
                </Link>
              ))}
              <a
                href={`https://wa.me/923338788861`}
                target="_blank"
                rel="noreferrer"
                className="mt-4 text-center bg-black text-white py-3 text-xs font-semibold tracking-widest uppercase"
              >
                Order Bulk Now
              </a>
              <a href={`tel:${PHONE}`} className="mt-2 text-center text-sm text-gray-500 py-2">
                {PHONE}
              </a>
            </nav>
          </div>
        )}
      </header>

      {/* Search overlay */}
      {isSearchOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]"
          onClick={() => dispatch(setSearchOpen(false))}
        >
          <div
            className="bg-white p-4 sm:p-6 max-w-2xl mx-auto mt-16 sm:mt-20 shadow-2xl mx-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
              <Search size={18} className="text-gray-400" />
              <input
                autoFocus
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') goToSearch(searchQuery);
                }}
                className="flex-1 outline-none text-sm"
              />
              <button onClick={() => dispatch(setSearchOpen(false))} aria-label="Close">
                <X size={18} />
              </button>
            </div>
            {searchQuery.trim() && (
              <div className="mt-3 max-h-80 overflow-y-auto divide-y divide-gray-50">
                {suggestions.map((p) => (
                  <button
                    key={p._id}
                    onClick={() => {
                      navigate(`/product/${p.slug}`);
                      dispatch(setSearchOpen(false));
                    }}
                    className="w-full flex items-center gap-3 py-2.5 text-left hover:bg-gray-50 px-2 transition"
                  >
                    <img
                      src={productImg(p)}
                      alt=""
                      className="w-12 h-12 object-cover bg-gray-100 shrink-0"
                    />
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-medium text-gray-900 truncate">{p.name}</span>
                      {p.article && (
                        <span className="block text-xs text-gray-500">Article: {p.article}</span>
                      )}
                    </span>
                    <span className="text-sm font-semibold shrink-0">
                      Rs {p.price?.toLocaleString?.() || p.price}
                    </span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => goToSearch(searchQuery)}
                  className="w-full py-3 text-sm font-medium text-center hover:bg-gray-50"
                >
                  See all results for “{searchQuery}”
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
