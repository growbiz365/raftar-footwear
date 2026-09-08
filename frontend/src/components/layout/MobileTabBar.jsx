import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutGrid, Heart, ShoppingBag, MessageCircle } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { setCartOpen, selectCartCount } from '../../store/slices/cartSlice';

export default function MobileTabBar() {
  const dispatch = useDispatch();
  const location = useLocation();
  const cartCount = useSelector(selectCartCount);
  const wishlist = useSelector((s) => s.cart.wishlist);

  const active = (path, startsWith) => {
    if (startsWith) return location.pathname.startsWith(path);
    return location.pathname === path;
  };

  const tabCls = (on) =>
    `relative flex flex-col items-center justify-center gap-0.5 flex-1 h-14 transition ${
      on ? 'text-[#0b4f86]' : 'text-gray-500'
    }`;

  const badge = (n) =>
    n > 0 && (
      <span className="absolute top-1 right-1/2 translate-x-4 min-w-[16px] h-4 px-1 bg-[#0b4f86] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
        {n > 99 ? '99+' : n}
      </span>
    );

  return (
    <nav className="fixed bottom-0 inset-x-0 z-[55] md:hidden bg-white border-t border-gray-200 shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
      <div className="flex" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <Link to="/" className={tabCls(active('/', false))}>
          <Home size={21} />
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        <Link to="/shop" className={tabCls(active('/shop', false) || active('/collections', true) || active('/product', true))}>
          <LayoutGrid size={21} />
          <span className="text-[10px] font-medium">Shop</span>
        </Link>
        <Link to="/wishlist" className={tabCls(active('/wishlist', false))}>
          <Heart size={21} />
          {badge(wishlist.length)}
          <span className="text-[10px] font-medium">Wishlist</span>
        </Link>
        <button onClick={() => dispatch(setCartOpen(true))} className={tabCls(false)}>
          <ShoppingBag size={21} />
          {badge(cartCount)}
          <span className="text-[10px] font-medium">Cart</span>
        </button>
        <a
          href="https://wa.me/923338788861"
          target="_blank"
          rel="noreferrer"
          className="relative flex flex-col items-center justify-center gap-0.5 flex-1 h-14 text-[#25D366]"
        >
          <MessageCircle size={21} />
          <span className="text-[10px] font-medium">WhatsApp</span>
        </a>
      </div>
    </nav>
  );
}