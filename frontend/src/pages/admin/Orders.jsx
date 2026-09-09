import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { adminFetchOrders, adminUpdateOrderStatus, adminDeleteOrder } from '../../store/slices/adminSlice';
import { ShoppingCart, Wallet, Clock, CheckCircle2, Search, Trash2 } from 'lucide-react';
import { useToast } from '../../components/admin/Toast';

const statuses = ['pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'];

const STATUS_CLS = {
  pending: 'bg-amber-100 text-amber-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-sky-100 text-sky-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-rose-100 text-rose-700',
};

export default function AdminOrders() {
  const dispatch = useDispatch();
  const { toast, confirm } = useToast();
  const { orders } = useSelector((s) => s.admin);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState(new Set());
  const PAGE_SIZE = 8;

  useEffect(() => {
    dispatch(adminFetchOrders());
  }, [dispatch]);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const pendingCount = orders.filter((o) => ['pending', 'processing', 'new'].includes(o.status)).length;
  const completedCount = orders.filter((o) => ['delivered', 'completed'].includes(o.status)).length;
  const todayCount = orders.filter((o) => new Date(o.createdAt) >= todayStart).length;
  const revenue = orders
    .filter((o) => ['delivered', 'completed'].includes(o.status))
    .reduce((s, o) => s + (o.total || 0), 0);

  const stats = [
    { label: 'Total Orders', value: orders.length, icon: ShoppingCart, color: 'bg-blue-500' },
    { label: 'Pending', value: pendingCount, icon: Clock, color: 'bg-amber-500' },
    { label: "Today's Orders", value: todayCount, icon: ShoppingCart, color: 'bg-indigo-500' },
    { label: 'Completed', value: completedCount, icon: CheckCircle2, color: 'bg-emerald-500' },
    { label: 'Revenue (delivered)', value: `Rs ${revenue.toLocaleString()}`, icon: Wallet, color: 'bg-rose-500' },
  ];

  const filtered = orders.filter((o) => {
    const q = query.trim().toLowerCase();
    if (
      q &&
      !String(o._id).toLowerCase().includes(q) &&
      !(o.customer?.name || '').toLowerCase().includes(q) &&
      !(o.customer?.phone || '').toLowerCase().includes(q) &&
      !(o.items || []).some((it) => (it.name || '').toLowerCase().includes(q))
    )
      return false;
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageOrders = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  const handleDelete = async (id) => {
    const ok = await confirm(`Delete order #${String(id).slice(-6).toUpperCase()}?`);
    if (!ok) return;
    try {
      await dispatch(adminDeleteOrder(id)).unwrap();
      toast('Order deleted');
    } catch {
      toast('Failed to delete order', 'error');
    }
    setSelected((prev) => { const next = new Set(prev); next.delete(id); return next; });
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    const ok = await confirm(`Delete ${selected.size} selected order(s)?`);
    if (!ok) return;
    try {
      await Promise.all([...selected].map((id) => dispatch(adminDeleteOrder(id)).unwrap()));
      toast(`${selected.size} order(s) deleted`);
    } catch {
      toast('Some orders could not be deleted', 'error');
    }
    setSelected(new Set());
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-semibold mb-6">Orders</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
        {stats.map((c, i) => (
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${c.color} text-white flex items-center justify-center shrink-0`}>
              <c.icon size={19} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-gray-500 truncate">{c.label}</p>
              <p className="text-lg font-semibold truncate">{c.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative md:col-span-2">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(0); }}
              placeholder="Search order #, customer, phone, product..."
              className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-[#0b4f86]"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0b4f86] bg-white"
          >
            <option value="all">All statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        {selected.size > 0 && (
          <div className="flex items-center justify-between bg-rose-50 border-b border-rose-100 px-4 py-2.5">
            <p className="text-sm text-rose-700 font-medium">{selected.size} selected</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setSelected(new Set())} className="px-3 py-1.5 text-sm text-gray-600 border rounded-lg bg-white hover:bg-gray-50">
                Clear
              </button>
              <button onClick={handleBulkDelete} className="px-3 py-1.5 text-sm text-white bg-rose-600 rounded-lg hover:bg-rose-700">
                Delete selected
              </button>
            </div>
          </div>
        )}
        <table className="w-full text-sm min-w-[760px]">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="w-8 p-4">
                <input
                  type="checkbox"
                  checked={pageOrders.length > 0 && pageOrders.every((o) => selected.has(o._id))}
                  onChange={(e) => {
                    setSelected((prev) => {
                      const next = new Set(prev);
                      if (e.target.checked) pageOrders.forEach((o) => next.add(o._id));
                      else pageOrders.forEach((o) => next.delete(o._id));
                      return next;
                    });
                  }}
                  className="accent-[#0b4f86]"
                  title="Select all on this page"
                />
              </th>
              <th className="text-left p-4 font-medium">Order ID</th>
              <th className="text-left p-4 font-medium">Customer</th>
              <th className="text-left p-4 font-medium">Items</th>
              <th className="text-left p-4 font-medium">Total</th>
              <th className="text-left p-4 font-medium">Status</th>
              <th className="text-left p-4 font-medium">Date</th>
              <th className="text-right p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageOrders.map((o) => (
              <tr key={o._id} className="border-b last:border-0 hover:bg-gray-50 align-top">
                <td className="p-4">
                  <input
                    type="checkbox"
                    checked={selected.has(o._id)}
                    onChange={(e) => {
                      setSelected((prev) => {
                        const next = new Set(prev);
                        if (e.target.checked) next.add(o._id);
                        else next.delete(o._id);
                        return next;
                      });
                    }}
                    className="accent-[#0b4f86]"
                  />
                </td>
                <td className="p-4 font-medium">#{String(o._id).slice(-6).toUpperCase()}</td>
                <td className="p-4">
                  {o.customer?.name || 'Guest'}
                  <br />
                  {o.customer?.email && <span className="text-xs text-gray-400">{o.customer.email}<br /></span>}
                  {o.customer?.phone && <span className="text-xs text-gray-500">{o.customer.phone}</span>}
                  {o.customer?.address && <span className="text-xs text-gray-400"><br />📍 {o.customer.address}</span>}
                  {!o.customer?.name && !o.customer?.email && !o.customer?.phone && (
                    <span className="text-xs text-gray-400">WhatsApp order</span>
                  )}
                </td>
                <td className="p-4">
                  <div className="space-y-1">
                    {o.items?.map((it, i) => (
                      <div key={i} className="text-xs">
                        {it.name} × {it.qty}
                        {it.packSize > 1 && <span className="text-[#0b4f86]"> (pack {it.packSize})</span>}
                        {it.color && <span> · {it.color}</span>}
                        {it.size && <span> · {it.size}</span>}
                      </div>
                    ))}
                  </div>
                </td>
                <td className="p-4 font-medium">Rs {(o.total || 0).toLocaleString()}</td>
                <td className="p-4">
                  <select
                    value={o.status}
                    onChange={(e) => {
                      dispatch(adminUpdateOrderStatus({ id: o._id, status: e.target.value }));
                      toast(`Order #${String(o._id).slice(-6).toUpperCase()} marked as ${e.target.value}`);
                    }}
                    className={`border rounded px-2 py-1 text-xs outline-none focus:border-black capitalize ${STATUS_CLS[o.status] || ''}`}
                  >
                    {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="p-4 text-gray-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                <td className="p-4 text-right whitespace-nowrap">
                  <button onClick={() => handleDelete(o._id)} className="p-1.5 hover:bg-rose-50 text-rose-600 rounded" title="Delete order">
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
            {pageOrders.length === 0 && (
              <tr><td colSpan={8} className="p-8 text-center text-gray-400">No orders found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > PAGE_SIZE && (
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
          <p className="text-xs text-gray-500">
            Showing {safePage * PAGE_SIZE + 1}–{Math.min((safePage + 1) * PAGE_SIZE, filtered.length)} of {filtered.length} orders
          </p>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={safePage === 0} className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-40">
              Prev
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button key={i} onClick={() => setPage(i)} className={`w-8 h-8 text-sm rounded-lg border ${i === safePage ? 'bg-[#0b4f86] text-white border-[#0b4f86]' : 'hover:bg-gray-50'}`}>
                {i + 1}
              </button>
            ))}
            <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={safePage >= totalPages - 1} className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-40">
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}