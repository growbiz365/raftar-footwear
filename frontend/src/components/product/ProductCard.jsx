import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye, ShoppingBag } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, toggleWishlist, selectIsInWishlist } from '../../store/slices/cartSlice';

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const inWishlist = useSelector(selectIsInWishlist(product._id));
  const onSale = product.compareAtPrice && product.compareAtPrice > product.price;

  const fallbackMap = {
    pink: '#f9a8d4', ivory: '#f5f5dc', cream: '#f5f5dc', beige: '#f5f5dc', 'off white': '#f5f5dc',
    gray: '#9ca3af', grey: '#9ca3af', 'dark green': '#4ade80', green: '#4ade80', sage: '#86efac',
    black: '#111', blue: '#3b82f6', 'navy blue': '#1e3a8a', navy: '#1e3a8a', purple: '#a855f7',
    gold: '#fbbf24', brown: '#92400e', white: '#fff', nude: '#e8c4a0', red: '#ef4444', multicolor: '#ddd',
  };

  const variants = (product.colorVariants?.length
    ? product.colorVariants
    : (product.colors || []).map((c) => ({
        name: c,
        hex: fallbackMap[String(c).toLowerCase()] || '#d1d5db',
      }))
  ).filter((v) => v?.name);

  const [activeIndex, setActiveIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const activeVariant = variants[activeIndex] || variants[0];
  const firstColor = activeVariant?.name || variants[0]?.name || product.colors?.[0];

  // Primary + secondary image for Revone-style hover swap
  const primaryImage =
    activeVariant?.image || product.images?.[0] || product.image || '/images/product-1.svg';
  const secondaryImage =
    product.images?.[1] ||
    product.hoverImage ||
    product.images?.[0] ||
    activeVariant?.image ||
    primaryImage;

  const displayImage = hovered && secondaryImage !== primaryImage ? secondaryImage : primaryImage;

  return (
    <div
      className="product-card group relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative overflow-hidden bg-[#f0ebe6] aspect-[3/4]">
        <Link to={`/product/${product.slug}`} className="block h-full relative">
          {/* Primary image */}
          <img
            src={primaryImage}
            alt={product.name}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
              hovered && secondaryImage !== primaryImage ? 'opacity-0' : 'opacity-100'
            }`}
            loading="lazy"
          />
          {/* Secondary / hover image */}
          {secondaryImage !== primaryImage && (
            <img
              src={secondaryImage}
              alt=""
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                hovered ? 'opacity-100' : 'opacity-0'
              }`}
              loading="lazy"
            />
          )}
          {/* Fallback scale when only one image */}
          {secondaryImage === primaryImage && (
            <img
              src={primaryImage}
              alt={product.name}
              className="product-img w-full h-full object-cover"
              loading="lazy"
            />
          )}
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.tags?.includes('Sale') && (
            <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wide">
              Sale
            </span>
          )}
          {product.tags?.includes('Best Seller') && (
            <span className="bg-black text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wide">
              Best Seller
            </span>
          )}
          {product.tags?.includes('New') && (
            <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wide">
              New
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={(e) => {
            e.preventDefault();
            dispatch(toggleWishlist(product));
          }}
          className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center transition ${
            inWishlist
              ? 'bg-black text-white'
              : 'bg-white/90 text-gray-700 hover:bg-black hover:text-white'
          }`}
          aria-label="Wishlist"
        >
          <Heart size={15} fill={inWishlist ? 'currentColor' : 'none'} />
        </button>

        {/* Bottom action bar — Revone style */}
        <div className="product-actions absolute bottom-0 left-0 right-0 flex z-10">
          <button
            onClick={() =>
              dispatch(
                addToCart({
                  product,
                  color: firstColor,
                  size: product.sizes?.[0],
                })
              )
            }
            className="flex-1 bg-black text-white text-[11px] font-semibold tracking-[0.12em] uppercase py-3 hover:bg-gray-900 transition flex items-center justify-center gap-1.5"
          >
            <ShoppingBag size={13} /> Add to Cart
          </button>
          <Link
            to={`/product/${product.slug}`}
            className="w-12 bg-white text-black flex items-center justify-center border-t border-l border-gray-100 hover:bg-gray-50 transition"
            aria-label="Quick view"
          >
            <Eye size={15} />
          </Link>
        </div>
      </div>

      <div className="pt-4 text-center px-1">
        <Link to={`/product/${product.slug}`} className="block">
          <h3 className="text-sm font-medium text-gray-900 group-hover:underline line-clamp-1">
            {product.name}
          </h3>
        </Link>
        <div className="mt-1.5 flex items-center justify-center gap-2">
          {onSale && (
            <span className="text-sm text-gray-400 line-through">
              Rs {Number(product.compareAtPrice).toLocaleString()}
            </span>
          )}
          <span
            className={`text-sm font-semibold ${onSale ? 'text-rose-600' : 'text-gray-900'}`}
          >
            Rs {Number(product.price).toLocaleString()}
          </span>
        </div>
        {variants.length > 0 && (
          <div className="mt-2.5 flex justify-center gap-1.5">
            {variants.slice(0, 5).map((v, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                title={v.name}
                aria-label={v.name}
                className={`w-3.5 h-3.5 rounded-full border transition ${
                  i === activeIndex
                    ? 'scale-110'
                    : 'border-gray-200 hover:scale-110'
                }`}
                style={{ backgroundColor: v.hex || '#d1d5db' }}
              />
            ))}
            {variants.length > 5 && (
              <span className="text-[10px] text-gray-400 self-center">+{variants.length - 5}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
