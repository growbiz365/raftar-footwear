import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../store/slices/productSlice';
import ProductCard from '../components/product/ProductCard';
import ShopFilters from '../components/shop/ShopFilters';
import { SlidersHorizontal, X } from 'lucide-react';

function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="aspect-square bg-gray-200 rounded-lg mb-3" />
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-1/3" />
    </div>
  );
}

const parseArr = (v) => (v ? v.split(',').map((x) => x.trim()).filter(Boolean) : []);

export default function Shop() {
  const dispatch = useDispatch();
  const { items: products, categories, loading } = useSelector((s) => s.products);
  const [searchParams, setSearchParams] = useSearchParams();
  const { category } = useParams();
  const q = searchParams.get('q');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const params = {};
    if (category) params.category = category;
    if (q) params.q = q;
    dispatch(fetchProducts(params));
  }, [dispatch, category, q]);

  const allProducts = useMemo(() => (Array.isArray(products) ? products : []), [products]);

  const filters = {
    cat: searchParams.get('cat') || 'all',
    brand: searchParams.get('brand') || 'all',
    sizes: parseArr(searchParams.get('sizes')),
    colors: parseArr(searchParams.get('colors')),
    tags: parseArr(searchParams.get('tags')),
    min: searchParams.get('min') || '',
    max: searchParams.get('max') || '',
    inStock: searchParams.get('instock') === '1',
    sort: searchParams.get('sort') || 'newest',
  };

  const PAGE_SIZE = 12;

  const setFilters = (patch) => {
    const next = new URLSearchParams(searchParams);
    if (q) next.set('q', q);
    Object.entries(patch).forEach(([key, value]) => {
      if (key === 'sort' && !value) return;
      if (Array.isArray(value)) {
        if (value.length) next.set(key, value.join(','));
        else next.delete(key);
      } else if (key === 'inStock') {
        if (value) next.set('instock', '1');
        else next.delete('instock');
      } else if (!value || value === 'all') {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    });
    // Changing any filter returns to page 1 (sorting keeps the current page).
    if (!('sort' in patch) || Object.keys(patch).some((k) => k !== 'sort')) next.delete('page');
    setSearchParams(next, { replace: true });
  };

  const clearFilters = () => {
    const next = new URLSearchParams();
    if (q) next.set('q', q);
    setSearchParams(next, { replace: true });
  };

  const goToPage = (n) => {
    const next = new URLSearchParams(searchParams);
    if (q) next.set('q', q);
    if (n <= 1) next.delete('page');
    else next.set('page', String(n));
    setSearchParams(next, { replace: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeCount =
    (filters.cat !== 'all' ? 1 : 0) +
    (filters.brand !== 'all' ? 1 : 0) +
    filters.sizes.length +
    filters.colors.length +
    filters.tags.length +
    (filters.min || filters.max ? 1 : 0) +
    (filters.inStock ? 1 : 0);

  const filteredProducts = useMemo(() => {
    let r = [...allProducts];

    if (filters.cat !== 'all') {
      const catSlug = filters.cat.toLowerCase();
      const cat = categories.find((c) => (c.slug || '').toLowerCase() === catSlug);
      const catName = (cat?.name || '').toLowerCase();
      r = r.filter(
        (p) =>
          (p.category || '').toLowerCase() === catSlug ||
          (p.category || '').toLowerCase() === catName
      );
    }

    if (filters.brand !== 'all') {
      r = r.filter((p) => (p.brand || '').toLowerCase() === filters.brand.toLowerCase());
    }

    if (filters.sizes.length) {
      r = r.filter((p) => (p.sizes || []).some((s) => filters.sizes.includes(String(s))));
    }

    if (filters.colors.length) {
      r = r.filter((p) => {
        const names = [
          ...(p.colorVariants || []).map((cv) => String(cv.name || '').toLowerCase()),
          ...(p.colors || []).map((c) => String(c).toLowerCase()),
        ];
        return filters.colors.some((c) => names.includes(c.toLowerCase()));
      });
    }

    if (filters.tags.length) {
      r = r.filter((p) => (p.tags || []).some((t) => filters.tags.includes(String(t))));
    }

    if (filters.min || filters.max) {
      r = r.filter((p) => {
        const price = Number(p.price) || 0;
        if (filters.min && price < Number(filters.min)) return false;
        if (filters.max && price > Number(filters.max)) return false;
        return true;
      });
    }

    if (filters.inStock) {
      r = r.filter((p) => Number(p.stock) > 0);
    }

    const sort = filters.sort;
    const sorted = [...r];
    if (sort === 'price-asc') sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
    else if (sort === 'price-desc') sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
    else if (sort === 'name-asc') sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    else if (sort === 'name-desc') sorted.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
    else sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    return sorted;
  }, [products, categories, filters]);

  const pageParam = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const page = Math.min(pageParam, totalPages);
  const pageItems = filteredProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const title = category
    ? category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ')
    : q
      ? `Search: "${q}"`
      : 'All Products';

  const filterBar = (
    <ShopFilters
      products={allProducts}
      categories={categories}
      filters={filters}
      onChange={setFilters}
      onClear={clearFilters}
      activeCount={activeCount}
    />
  );

  const sortSelect = (
    <select
      value={filters.sort}
      onChange={(e) => setFilters({ sort: e.target.value })}
      className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0b4f86] bg-white"
    >
      <option value="newest">Newest</option>
      <option value="price-asc">Price: Low to High</option>
      <option value="price-desc">Price: High to Low</option>
      <option value="name-asc">Name: A–Z</option>
      <option value="name-desc">Name: Z–A</option>
    </select>
  );

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-medium">{title}</h1>
        <p className="text-gray-500 mt-1">
          {loading && filteredProducts.length === 0 ? 'Loading…' : `${filteredProducts.length} products`} · Prices in PKR · Packs 1 / 6 / 12
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="lg:hidden flex items-center gap-2 border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium bg-white hover:border-gray-400"
        >
          <SlidersHorizontal size={15} />
          Filters
          {activeCount > 0 && (
            <span className="bg-black text-white text-[10px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </button>
        <div className="hidden lg:block text-sm text-gray-500">
          {activeCount > 0 ? `${activeCount} active filter${activeCount > 1 ? 's' : ''}` : 'Showing all products'}
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-sm text-gray-500">Sort</span>
          {sortSelect}
        </div>
      </div>

      <div className="grid lg:grid-cols-[250px_1fr] gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-28">{filterBar}</div>
        </aside>

        {/* Results */}
        <div>
          {loading && filteredProducts.length === 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {[...Array(8)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 text-gray-500 flex flex-col items-center gap-3">
              <p>No products match the selected filters.</p>
              <button
                type="button"
                onClick={clearFilters}
                className="border border-gray-300 rounded-lg px-4 py-2 text-sm hover:border-gray-500"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
                {pageItems.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex flex-wrap items-center justify-between gap-3 mt-10">
                  <p className="text-xs text-gray-500">
                    Showing {(page - 1) * PAGE_SIZE + 1}–
                    {Math.min(page * PAGE_SIZE, filteredProducts.length)} of {filteredProducts.length} products
                  </p>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => goToPage(page - 1)}
                      disabled={page === 1}
                      className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-40"
                    >
                      Prev
                    </button>
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => goToPage(i + 1)}
                        className={`w-9 h-9 text-sm rounded-lg border transition ${
                          page === i + 1
                            ? 'bg-[#0b4f86] text-white border-[#0b4f86]'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => goToPage(page + 1)}
                      disabled={page >= totalPages}
                      className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-0 right-0 bottom-0 w-[85%] max-w-[340px] bg-white h-full overflow-y-auto p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button type="button" onClick={() => setMobileOpen(false)} className="p-1 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>
            {filterBar}
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="mt-6 w-full bg-[#0b4f86] text-white py-3 rounded-xl text-sm font-semibold"
            >
              Show {filteredProducts.length} products
            </button>
          </div>
        </div>
      )}
    </div>
  );
}