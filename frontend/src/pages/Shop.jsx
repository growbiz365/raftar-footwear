import { useEffect } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../store/slices/productSlice';
import ProductCard from '../components/product/ProductCard';

function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/4] bg-gray-200 rounded-lg mb-3" />
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-1/3" />
    </div>
  );
}

export default function Shop() {
  const dispatch = useDispatch();
  const { items: products, loading } = useSelector((s) => s.products);
  const [searchParams] = useSearchParams();
  const { category } = useParams();
  const q = searchParams.get('q');

  useEffect(() => {
    const params = {};
    if (category) params.category = category;
    if (q) params.q = q;
    dispatch(fetchProducts(params));
  }, [dispatch, category, q]);

  const list = Array.isArray(products) ? products : [];
  const title = category
    ? category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ')
    : q
      ? `Search: "${q}"`
      : 'All Products';

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-medium">{title}</h1>
        <p className="text-gray-500 mt-1">
          {loading && list.length === 0 ? 'Loading…' : `${list.length} products`} · Prices in PKR · Packs 1 / 6 / 12
        </p>
      </div>
      {loading && list.length === 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {[...Array(8)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : list.length === 0 ? (
        <p className="text-center py-20 text-gray-500">No products found.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {list.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
