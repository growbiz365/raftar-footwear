import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Heart, ShoppingBag, Menu, X, ChevronDown, Phone } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { setCartOpen, setSearchOpen, selectCartCount } from '../../store/slices/cartSlice';
import api from '../../services/api';

const LOGO = 'https://res.cloudinary.com/dj5hgapcp/image/upload/v1788771608/raftar-footwear/logo.webp.webp';
const PHONE = '03338788861';

export default function Header() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const cartCount = useSelector(selectCartCount);
  const wishlist = useSelector(s => s.cart.wishlist);
  const isSearchOpen = useSelector(s => s.cart.isSearchOpen);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [allProducts, setAllProducts] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [promoBar, setPromoBar] = useState('★ Quality Footwear, Every Step of the Way. | Wholesale Packs: 1 · 6 · 12');
  const dropdownRef = useRef(null);

  useEffect(() => {
    api.get('/settings').then(r => {
      const d = r.data?.data;
      if (d?.promoBar) setPromoBar(typeof d.promoBar === 'string' ? d.promoBar : d.promoBar);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isSearchOpen) return;
    setSearchQuery('');
    api.get('/products', { params: { limit: 200 } })
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
    { label: 'All Products', to: '/shop' },
    { label: "Men's Footwear", to: '/collections/men' },
    { label: "Women's Footwear", to: '/collections/women' },
    { label: "Children's Footwear", to: '/collections/children' },
    { label: 'Slides', to: '/collections/slides' },
    { label: 'Chappals', to: '/collections/chappals' },
  ];

  const navLink = (to, label) => (
    <Link
      to={to}
      className={`py-2 text-sm font-semibold tracking-wide transition hover:text-[#0b4f86] ${
        location.pathname === to || location.pathname.startsWith(to + '/') ? 'text-[#0b4f86]' : 'text-slate-700'
      }`}
    >
      {label}
    </Link>
  );

  return (
    <>
      {/* Top bar */}
      <div className="bg-[#0b4f86] text-white text-center text-[10px] sm:text-xs py-1.5 px-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
        <a href={`tel:${PHONE}`} className="hover:underline flex items-center gap-1 font-semibold">
          <Phone size={12} /> {PHONE}
        </a>
        <span className="hidden sm:inline">|</span>
        <a href="https://wa.me/923338788861" target="_blank" rel="noreferrer" className="hover:underline hidden sm:inline">
          WhatsApp Order
        </a>
        <span className="hidden md:inline">|</span>
        <a href="mailto:info@raftarfootwear.com" className="hover:underline hidden md:inline">
          info@raftarfootwear.com
        </a>
      </div>
      <div className="bg-black text-white text-center text-[10px] sm:text-xs py-1.5 tracking-wide px-2 whitespace-nowrap overflow-hidden text-ellipsis">
        {promoBar}
      </div>

      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm" ref={dropdownRef}>
        <div className="max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 lg:h-[72px]">
            <button className="lg:hidden p-2 -ml-1" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Menu">
              {mobileMenu ? <X size={22} /> : <Menu size={22} />}
            </button>

            <Link to="/" className="flex items-center">
              <img src={LOGO} alt="Raftar Footwear" className="h-10 sm:h-12 lg:h-14 w-auto object-contain" loading="eager" decoding="async" />
            </Link>

            <nav className="hidden lg:flex items-center gap-5 xl:gap-7">
              {navLink('/', 'Home')}
              <div className="relative" onMouseEnter={() => setOpenDropdown('shop')} onMouseLeave={() => setOpenDropdown(null)}>
                <Link
                  to="/shop"
                  className={`flex items-center gap-1 py-2 text-sm font-semibold transition hover:text-[#0b4f86] ${
                    location.pathname === '/shop' ? 'text-[#0b4f86]' : 'text-slate-700'
                  }`}
                >
                  Shop <ChevronDown size={14} />
                </Link>
                {openDropdown === 'shop' && (
                  <div className="absolute top-full left-0 mt-0 w-56 bg-white shadow-xl border rounded-b-lg py-2 z-50">
                    {shopLinks.map((l) => (
                      <Link
                        key={l.to}
                        to={l.to}
                        className="block px-4 py-2.5 text-sm hover:bg-slate-50 hover:text-[#0b4f86]"
                        onClick={() => setOpenDropdown(null)}
                      >
                        {l.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              {navLink('/collections/raftar', 'Raftar Footwear')}
              {navLink('/collections/superstar', 'Superstar Footwear')}
              {navLink('/blog', 'Blog')}
              {navLink('/about', 'About')}
              {navLink('/manufacturing', 'Manufacturing')}
              {navLink('/contact', 'Contact')}
              <a
                href={`https://wa.me/923338788861`}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl bg-[#0b4f86] px-4 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-[#083d6a] transition"
              >
                Order Bulk Now
              </a>
            </nav>

            <div className="flex items-center gap-2 sm:gap-3">
              <button onClick={() => dispatch(setSearchOpen(true))} className="p-1.5 hover:opacity-70">
                <Search size={18} />
              </button>
              <Link to="/wishlist" className="p-1.5 hover:opacity-70 relative hidden sm:block">
                <Heart size={18} />
                {wishlist.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[#0b4f86] text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </Link>
              <button onClick={() => dispatch(setCartOpen(true))} className="p-1.5 hover:opacity-70 relative">
                <ShoppingBag size={18} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[#0b4f86] text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {mobileMenu && (
          <div className="lg:hidden border-t bg-white max-h-[80vh] overflow-y-auto">
            <nav className="flex flex-col p-4 gap-1 text-sm font-semibold">
              <Link to="/" onClick={() => setMobileMenu(false)} className="py-3 border-b">
                Home
              </Link>
              <p className="py-2 text-xs text-gray-400 uppercase tracking-wider">Shop</p>
              {shopLinks.map((l) => (
                <Link key={l.to} to={l.to} onClick={() => setMobileMenu(false)} className="py-2 pl-3">
                  {l.label}
                </Link>
              ))}
              <Link to="/collections/raftar" onClick={() => setMobileMenu(false)} className="py-3 border-t font-bold text-[#0b4f86]">
                Raftar Footwear
              </Link>
              <Link to="/collections/superstar" onClick={() => setMobileMenu(false)} className="py-3 font-bold text-[#0b4f86]">
                Superstar Footwear
              </Link>
              <Link to="/blog" onClick={() => setMobileMenu(false)} className="py-3 border-t">
                Blog
              </Link>
              <Link to="/about" onClick={() => setMobileMenu(false)} className="py-3">
                About
              </Link>
              <Link to="/manufacturing" onClick={() => setMobileMenu(false)} className="py-3">
                Manufacturing
              </Link>
              <Link to="/contact" onClick={() => setMobileMenu(false)} className="py-3 border-b">
                Contact
              </Link>
              <a
                href={`tel:${PHONE}`}
                className="mt-2 flex items-center justify-center gap-2 bg-[#0b4f86] text-white text-center py-3 rounded-xl font-bold"
              >
                <Phone size={16} /> {PHONE}
              </a>
            </nav>
          </div>
        )}
      </header>

      {isSearchOpen && (
        <div className="fixed inset-0 z-[60] bg-black/50" onClick={() => dispatch(setSearchOpen(false))}>
          <div
            className="bg-white p-4 sm:p-6 max-w-2xl mx-auto mt-16 sm:mt-20 rounded-lg shadow-xl mx-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b pb-3">
              <Search size={20} className="text-gray-400" />
              <input
                autoFocus
                type="text"
                placeholder="Search footwear..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') goToSearch(searchQuery);
                }}
                className="flex-1 outline-none text-base"
              />
              <button onClick={() => dispatch(setSearchOpen(false))}>
                <X size={20} />
              </button>
            </div>

            {searchQuery.trim() && (
              <div className="mt-3 max-h-80 overflow-y-auto divide-y divide-gray-100">
                {suggestions.map((p) => (
                  <button
                    key={p._id}
                    onClick={() => {
                      navigate(`/product/${p.slug}`);
                      dispatch(setSearchOpen(false));
                    }}
                    className="w-full flex items-center gap-3 py-2.5 text-left hover:bg-gray-50 rounded-lg px-2 transition"
                  >
                    <img src={productImg(p)} alt="" className="w-12 h-12 rounded-lg object-cover bg-gray-100 shrink-0" />
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-medium text-gray-900 truncate">{p.name}</span>
                      {p.article && <span className="block text-xs text-gray-500">Article: {p.article}</span>}
                    </span>
                    <span className="text-sm font-semibold text-[#0b4f86] shrink-0">Rs {p.price?.toLocaleString?.() || p.price}</span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => goToSearch(searchQuery)}
                  className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-[#0b4f86] hover:bg-blue-50 rounded-lg transition"
                >
                  <Search size={15} /> See all results for "{searchQuery}"
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
