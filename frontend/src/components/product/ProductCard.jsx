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
    gold: '#fbbf24', brown: '#92400e', white: '#fff', nude: '#e8c4a0', red: '#ef4444', multicolor: '#ddd'
  };

  // Use saved colorVariants (hex + image) so each color links to the product;
  // fall back to plain colors mapped through a name->hex table.
  const variants = (product.colorVariants?.length
    ? product.colorVariants
    : (product.colors || []).map((c) => ({ name: c, hex: fallbackMap[String(c).toLowerCase()] || '#d1d5db' }))
  ).filter((v) => v?.name);

  const [activeIndex, setActiveIndex] = useState(0);
  const activeVariant = variants[activeIndex] || variants[0];
  const firstColor = activeVariant?.name || variants[0]?.name || product.colors?.[0];
  const mainImage = activeVariant?.image || product.images?.[0] || product.image || '/images/product-1.svg';

  return (
    <div className="product-card group relative">
      <div className="relative overflow-hidden bg-gray-50 aspect-[3/4]">
        <Link to={`/product/${product.slug}`}>
          <img key={mainImage} src={mainImage} alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
        </Link>
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.tags?.includes('Sale') && <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wide">Sale</span>}
          {product.tags?.includes('Best Seller') && <span className="bg-black text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wide">Best Seller</span>}
          {product.tags?.includes('Trending') && <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wide">Trending</span>}
          {product.tags?.includes('Footwear') && <span className="bg-amber-600 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wide">Footwear</span>}
        </div>
        <div className="product-actions absolute bottom-3 left-0 right-0 flex justify-center gap-2 px-3">
          <button onClick={() => dispatch(toggleWishlist(product))}
            className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md transition ${inWishlist ? 'bg-rose-500 text-white' : 'bg-white hover:bg-black hover:text-white'}`}>
            <Heart size={16} fill={inWishlist ? 'currentColor' : 'none'} />
          </button>
          <button onClick={() => dispatch(addToCart({ product, color: firstColor, size: product.sizes?.[0] }))}
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md hover:bg-black hover:text-white transition">
            <ShoppingBag size={16} />
          </button>
          <Link to={`/product/${product.slug}`}
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md hover:bg-black hover:text-white transition">
            <Eye size={16} />
          </Link>
        </div>
      </div>
      <div className="pt-4 text-center">
        <Link to={`/product/${product.slug}`} className="block">
          <h3 className="text-sm font-medium text-gray-900 hover:underline line-clamp-1">{product.name}</h3>
        </Link>
        <div className="mt-1.5 flex items-center justify-center gap-2">
          {onSale && <span className="text-sm text-gray-400 line-through">Rs {product.compareAtPrice}</span>}
          <span className={`text-sm font-semibold ${onSale ? 'text-rose-600' : 'text-gray-900'}`}>Rs {Number(product.price).toLocaleString()}</span>
        </div>
        {variants.length > 0 && (
          <div className="mt-2 flex justify-center gap-1.5">
            {variants.slice(0, 4).map((v, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                title={v.name}
                aria-label={v.name}
                className={`w-4 h-4 rounded-full border transition ${
                  i === activeIndex ? 'ring-2 ring-[#0b4f86] ring-offset-1' : 'border-gray-200 hover:scale-110'
                }`}
                style={{ backgroundColor: v.hex || '#d1d5db' }}
              />
            ))}
            {variants.length > 4 && <span className="text-xs text-gray-400">+{variants.length - 4}</span>}
          </div>
        )}
      </div>
    </div>
  );
}