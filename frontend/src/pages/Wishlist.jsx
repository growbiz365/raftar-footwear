import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import ProductCard from '../components/product/ProductCard';

export default function Wishlist() {
  const wishlist = useSelector((s) => s.cart.wishlist || []);

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-3xl font-medium mb-2">My Favorites</h1>
      <p className="text-gray-500 mb-8">{wishlist.length} saved product{wishlist.length === 1 ? '' : 's'}</p>

      {wishlist.length === 0 ? (
        <div className="text-center py-24">
          <Heart size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600 mb-6">You haven't added any products to your favorites yet.</p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 bg-[#0b4f86] text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-[#083d6a] transition"
          >
            Browse products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {wishlist.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}

      {wishlist.length > 0 && (
        <div className="mt-8 text-center text-xs text-gray-400">
          Tip: click the <Heart size={12} className="inline -mt-0.5 text-rose-500" /> on any saved product to remove it from your favorites.
        </div>
      )}
    </div>
  );
}