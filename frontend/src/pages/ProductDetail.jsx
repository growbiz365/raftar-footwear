import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, ShoppingBag, Phone, MessageCircle } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProduct } from '../store/slices/productSlice';
import { addToCart, toggleWishlist, selectIsInWishlist } from '../store/slices/cartSlice';
import { fetchProducts } from '../store/slices/productSlice';
import ProductCard from '../components/product/ProductCard';
import { openWhatsApp, embedImageInText, messageAlreadySent, markWhatsAppSent } from '../utils/whatsapp';
import { safeImage } from '../utils/img';

const PACKS = [1, 6, 12];
const WHATSAPP = '923338788861';
const PHONE = '03338788861';

export default function ProductDetail() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const { current: product, loading } = useSelector((s) => s.products);
  const inWishlist = useSelector(selectIsInWishlist(product?._id));
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [packSize, setPackSize] = useState(1);
  const [activeImg, setActiveImg] = useState('');
  const allProducts = useSelector((s) => s.products.items);

  useEffect(() => {
    dispatch(fetchProduct(slug));
    dispatch(fetchProducts());
  }, [dispatch, slug]);

  useEffect(() => {
    if (product) {
      const firstColor = product.colorVariants?.[0]?.name || product.colors?.[0] || '';
      setSelectedColor(firstColor);
      setSelectedSize(product.sizes?.[0] || '');
      setActiveImg('');
    }
  }, [product]);

  if (loading && !product) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="aspect-square bg-gray-100 animate-pulse rounded-xl" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-100 animate-pulse rounded w-3/4" />
            <div className="h-6 bg-gray-100 animate-pulse rounded w-1/4" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 mb-4">Product not found</p>
        <Link to="/shop" className="underline text-[#0b4f86]">
          Back to shop
        </Link>
      </div>
    );
  }

  // Normalize colors – never show glued names like "BlackBrown"
  const rawColors = product.colorVariants?.length
    ? product.colorVariants
    : (product.colors || []).flatMap((c) => {
        if (typeof c !== 'string') return [c];
        // split on comma or camelCase boundaries
        if (c.includes(',')) return c.split(',').map((s) => s.trim()).filter(Boolean);
        const parts = c.replace(/([a-z])([A-Z])/g, '$1 $2').split(/[\s/|]+/).map((s) => s.trim()).filter(Boolean);
        return parts.length ? parts : [c];
      });
  const variants = rawColors.map((c) =>
    typeof c === 'string'
      ? { name: c, hex: '#888888', image: product.images?.[0] || '' }
      : { name: c.name || '', hex: c.hex || '#888888', image: c.image || product.images?.[0] || '' }
  ).filter((v) => v.name);

  const currentVariant = variants.find((v) => v.name === selectedColor) || variants[0];
  const allImages = [
    ...variants.map((v) => safeImage(v.image)).filter(Boolean),
    ...(product.images || []).map(safeImage),
  ].filter((img, i, arr) => img && arr.indexOf(img) === i);
  const displayImages = [
    ...(currentVariant?.image ? [safeImage(currentVariant.image)] : []),
    ...allImages.filter((img) => img !== safeImage(currentVariant?.image || '')),
  ].filter(Boolean);

  const shownImg = activeImg || displayImages[0];

  const hideBroken = (e) => {
    e.currentTarget.style.visibility = 'hidden';
  };

  const packPrices = product.packPrices || {
    1: product.price,
    6: Math.round(product.price * 6 * 0.95),
    12: Math.round(product.price * 12 * 0.9),
  };
  const totalPrice = packPrices[packSize] ?? product.price * packSize;
  const unitPrice = packSize > 0 ? totalPrice / packSize : product.price;
  const onSale = product.compareAtPrice && product.compareAtPrice > product.price;

  const handleAdd = () => {
    dispatch(
      addToCart({
        product: { ...product, price: unitPrice },
        quantity: packSize,
        color: selectedColor,
        size: selectedSize,
        packSize,
      })
    );
  };

  const sendWhatsApp = () => {
    const base = `Hi Raftar Footwear!\nI want to order:\n*${product.name}* (Article: ${product.article || 'N/A'})\nColor: ${selectedColor}\nSize: ${selectedSize}\nPack: ${packSize} pairs\nTotal: Rs ${totalPrice}\n\nPlease confirm availability.`;
    const withImg = `${base}\n${embedImageInText(shownImg)}`;
    const body = messageAlreadySent(WHATSAPP, base) ? base : withImg;
    markWhatsAppSent(WHATSAPP, base);
    openWhatsApp(WHATSAPP, body);
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <nav className="text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-[#0b4f86]">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link to="/shop" className="hover:text-[#0b4f86]">
          Shop
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-14">
        {/* Images */}
        <div>
          <div className="aspect-square bg-gray-50 overflow-hidden rounded-2xl mb-4 border border-gray-100">
            <img
              src={shownImg}
              alt={product.name}
              onError={hideBroken}
              className="w-full h-full object-cover"
            />
          </div>
          {displayImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {displayImages.map((img, i) => {
                const colorMatch = variants.find((v) => safeImage(v.image) === img);
                return (
                  <button
                    key={i}
                    onClick={() => {
                      setActiveImg(img);
                      if (colorMatch) setSelectedColor(colorMatch.name);
                    }}
                    className={`w-20 h-24 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                      img === shownImg ? 'border-[#0b4f86]' : 'border-transparent'
                    }`}
                    title={colorMatch ? colorMatch.name : `Image ${i + 1}`}
                  >
                    <img src={img} alt="" onError={hideBroken} className="w-full h-full object-cover" />
                    {colorMatch && (
                      <span className="text-[10px] text-center block bg-black/60 text-white truncate">
                        {colorMatch.name}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="flex flex-wrap gap-2 mb-3">
            {product.brand && (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#0b4f86] text-white px-2.5 py-1 rounded">
                {product.brand}
              </span>
            )}
            {product.tags?.map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-bold uppercase tracking-wider bg-rose-500 text-white px-2.5 py-1 rounded"
              >
                {tag}
              </span>
            ))}
          </div>

          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-medium mb-2 text-slate-900">
            {product.name}
          </h1>
          {product.article && (
            <p className="text-sm text-gray-500 mb-4">Article: {product.article}</p>
          )}

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-2xl sm:text-3xl font-semibold text-[#0b4f86]">
              Rs {totalPrice.toLocaleString()}
            </span>
            {packSize > 1 && (
              <span className="text-sm text-gray-500">
                (Rs {Math.round(unitPrice)} / pair · {packSize} pairs)
              </span>
            )}
            {onSale && packSize === 1 && (
              <span className="text-lg text-gray-400 line-through">
                Rs {product.compareAtPrice}
              </span>
            )}
          </div>

          <p className="text-gray-600 leading-relaxed mb-8">{product.description}</p>

          {/* Color variants */}
          {variants.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-semibold mb-3">
                Color: <span className="font-normal text-gray-600">{selectedColor}</span>
              </p>
              <div className="flex gap-2 flex-wrap">
                {variants.map((v) => (
                  <button
                    key={v.name}
                    onClick={() => {
                      setSelectedColor(v.name);
                      setActiveImg(v.image || '');
                    }}
                    className={`flex flex-col items-center gap-1 py-2 px-3 rounded-xl border-2 transition ${
                      selectedColor === v.name
                        ? 'border-[#0b4f86] bg-blue-50'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <span
                      className="w-8 h-8 rounded-full border-2 border-white shadow ring-1 ring-gray-300 shrink-0"
                      style={{ backgroundColor: v.hex || '#ccc' }}
                    />
                    <span className="text-xs font-medium text-gray-700">{v.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size */}
          {product.sizes?.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-semibold mb-3">
                Size: <span className="font-normal text-gray-600">{selectedSize}</span>
              </p>
              <div className="flex gap-2 flex-wrap">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[3rem] h-11 px-3 border-2 text-sm rounded-xl transition font-medium ${
                      selectedSize === size
                        ? 'border-[#0b4f86] bg-[#0b4f86] text-white'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Wholesale pack selector */}
          <div className="mb-8">
            <p className="text-sm font-semibold mb-3">
              Pack Size (Wholesale)
            </p>
            <div className="grid grid-cols-3 gap-3">
              {PACKS.map((n) => {
                const price = packPrices[n] ?? product.price * n;
                const save =
                  n > 1
                    ? Math.round(((product.price * n - price) / (product.price * n)) * 100)
                    : 0;
                return (
                  <button
                    key={n}
                    onClick={() => setPackSize(n)}
                    className={`relative flex flex-col items-center justify-center py-4 rounded-2xl border-2 transition ${
                      packSize === n
                        ? 'border-[#0b4f86] bg-blue-50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-lg font-bold">{n}</span>
                    <span className="text-xs text-gray-500">pairs</span>
                    <span className="text-sm font-semibold text-[#0b4f86] mt-1">
                      Rs {price.toLocaleString()}
                    </span>
                    {save > 0 && (
                      <span className="absolute -top-2 -right-1 bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                        -{save}%
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <button
              onClick={handleAdd}
              className="flex-1 flex items-center justify-center gap-2 bg-[#0b4f86] text-white py-4 rounded-xl font-semibold hover:bg-[#083d6a] transition shadow-lg shadow-blue-200"
            >
              <ShoppingBag size={18} /> Add {packSize} pair{packSize > 1 ? 's' : ''} to Cart
            </button>
            <button
              onClick={() => dispatch(toggleWishlist(product))}
              className={`px-5 py-4 rounded-xl border-2 transition ${
                inWishlist ? 'border-rose-500 text-rose-500 bg-rose-50' : 'border-gray-200 hover:border-gray-400'
              }`}
            >
              <Heart size={20} fill={inWishlist ? 'currentColor' : 'none'} />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={sendWhatsApp}
              className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-white py-3.5 rounded-xl font-semibold hover:bg-[#1da851] transition"
            >
              <MessageCircle size={18} /> Order via WhatsApp
            </button>
            <a
              href={`tel:${PHONE}`}
              className="flex items-center justify-center gap-2 border-2 border-[#0b4f86] text-[#0b4f86] py-3.5 px-5 rounded-xl font-semibold hover:bg-blue-50 transition"
            >
              <Phone size={18} /> {PHONE}
            </a>
          </div>

          <div className="mt-8 pt-6 border-t text-sm text-gray-500 space-y-1">
            <p>✓ Wholesale ready · Pack sizes 1, 6 & 12</p>
            <p>✓ Direct from manufacturer · Peshawar</p>
            <p>✓ Quality PCU & PVC materials</p>
          </div>
        </div>
      </div>

      {/* Related products */}
      {allProducts && allProducts.filter((p) => p._id !== product._id && (p.category === product.category || p.brand === product.brand)).length > 0 && (
        <section className="mt-16 pt-10 border-t">
          <h2 className="font-display text-2xl sm:text-3xl font-medium mb-6">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {allProducts
              .filter((p) => p._id !== product._id && (p.category === product.category || p.brand === product.brand))
              .slice(0, 4)
              .map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
          </div>
        </section>
      )}

    </div>
  );
}
