import { useMemo } from 'react';
import { ChevronDown, X } from 'lucide-react';

const labelCls = 'text-[11px] font-semibold uppercase tracking-wider text-gray-400';

function Group({ title, children, defaultOpen = true }) {
  return (
    <details open={defaultOpen} className="group border-b border-gray-100 py-4">
      <summary className="flex items-center justify-between cursor-pointer list-none text-sm font-medium text-gray-800">
        {title}
        <ChevronDown size={15} className="text-gray-400 transition-transform group-open:rotate-180" />
      </summary>
      <div className="mt-3">{children}</div>
    </details>
  );
}

function CheckRow({ checked, onChange, label, hex }) {
  return (
    <label className="flex items-center gap-2.5 text-sm text-gray-600 hover:text-gray-800 cursor-pointer py-1">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="accent-[#0b4f86] w-4 h-4 shrink-0"
      />
      {hex && (
        <span
          className="w-4 h-4 rounded-full border border-gray-200 shrink-0"
          style={{ backgroundColor: hex }}
        />
      )}
      <span className="truncate">{label}</span>
    </label>
  );
}

function RadioRow({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-2.5 text-sm text-gray-600 hover:text-gray-800 cursor-pointer py-1">
      <input
        type="radio"
        checked={checked}
        onChange={onChange}
        className="accent-[#0b4f86] w-4 h-4 shrink-0"
      />
      <span className="truncate">{label}</span>
    </label>
  );
}

export default function ShopFilters({ products, categories, filters, onChange, onClear, activeCount }) {
  const rawColors = useMemo(() => {
    const map = new Map();
    const push = (name, hex) => {
      const n = String(name || '').trim();
      if (!n) return;
      const key = n.toLowerCase();
      if (!map.has(key)) map.set(key, { name: n, hex: hex || '' });
    };
    (products || []).forEach((p) => {
      (p.colorVariants || []).forEach((cv) => push(cv.name, cv.hex));
      (p.colors || []).forEach((c) => push(c, ''));
    });
    return Array.from(map.values());
  }, [products]);

  const sizes = useMemo(() => {
    const set = new Set();
    (products || []).forEach((p) => (p.sizes || []).forEach((s) => set.add(String(s))));
    return Array.from(set);
  }, [products]);

  const tags = useMemo(() => {
    const set = new Set();
    (products || []).forEach((p) => (p.tags || []).forEach((t) => set.add(String(t))));
    return Array.from(set);
  }, [products]);

  const brands = useMemo(() => {
    const set = new Set();
    (products || []).forEach((p) => p.brand && set.add(String(p.brand)));
    return Array.from(set);
  }, [products]);

  const setArr = (key, value, checked) =>
    onChange({ [key]: checked ? [...filters[key], value] : filters[key].filter((v) => v !== value) });

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h2 className={labelCls}>Filters</h2>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="flex items-center gap-1 text-xs text-[#0b4f86] hover:underline"
          >
            <X size={12} />
            Clear all ({activeCount})
          </button>
        )}
      </div>

      {categories.length > 0 && (
        <Group title="Category">
          <RadioRow
            checked={filters.cat === 'all'}
            onChange={() => onChange({ cat: 'all' })}
            label="All categories"
          />
          {categories.map((c) => (
            <RadioRow
              key={c._id}
              checked={filters.cat === (c.slug || c.name)}
              onChange={() => onChange({ cat: c.slug || c.name })}
              label={`${c.name}`}
            />
          ))}
        </Group>
      )}

      {brands.length > 0 && (
        <Group title="Brand">
          <RadioRow checked={filters.brand === 'all'} onChange={() => onChange({ brand: 'all' })} label="All brands" />
          {brands.map((b) => (
            <RadioRow
              key={b}
              checked={filters.brand === b}
              onChange={() => onChange({ brand: b })}
              label={b.charAt(0).toUpperCase() + b.slice(1)}
            />
          ))}
        </Group>
      )}

      <Group title="Price" defaultOpen={false}>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            placeholder="Min"
            value={filters.min}
            onChange={(e) => onChange({ min: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0b4f86]"
          />
          <span className="text-gray-400">–</span>
          <input
            type="number"
            min="0"
            placeholder="Max"
            value={filters.max}
            onChange={(e) => onChange({ max: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0b4f86]"
          />
        </div>
        <label className="flex items-center gap-2.5 text-sm text-gray-600 cursor-pointer mt-3">
          <input
            type="checkbox"
            checked={filters.inStock}
            onChange={(e) => onChange({ inStock: e.target.checked })}
            className="accent-[#0b4f86] w-4 h-4"
          />
          In stock only
        </label>
      </Group>

      {rawColors.length > 0 && (
        <Group title="Color" defaultOpen={false}>
          <div className="max-h-44 overflow-y-auto pr-1">
            {rawColors.map((c) => (
              <CheckRow
                key={c.name.toLowerCase()}
                checked={filters.colors.includes(c.name)}
                onChange={(e) => setArr('colors', c.name, e.target.checked)}
                label={c.name}
                hex={c.hex || ''}
              />
            ))}
          </div>
        </Group>
      )}

      {sizes.length > 0 && (
        <Group title="Size" defaultOpen={false}>
          <div className="flex flex-wrap gap-1.5">
            {sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setArr('sizes', s, !filters.sizes.includes(s))}
                className={`px-3 py-1.5 text-xs rounded-lg border transition ${
                  filters.sizes.includes(s)
                    ? 'bg-black text-white border-black'
                    : 'border-gray-200 text-gray-600 hover:border-gray-400'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </Group>
      )}

      {tags.length > 0 && (
        <Group title="Tags" defaultOpen={false}>
          {tags.map((t) => (
            <CheckRow
              key={t}
              checked={filters.tags.includes(t)}
              onChange={(e) => setArr('tags', t, e.target.checked)}
              label={t}
            />
          ))}
        </Group>
      )}
    </div>
  );
}