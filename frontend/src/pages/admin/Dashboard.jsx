import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboard } from '../../store/slices/adminSlice';
import {
  Package,
  ShoppingCart,
  Users,
  Wallet,
  TrendingUp,
  AlertTriangle,
  Clock,
  Layers,
} from 'lucide-react';

const fmt = (n) => `Rs ${Number(n || 0).toLocaleString('en-PK')}`;

const STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-700',
  processing: 'bg-blue-100 text-blue-700',
  new: 'bg-sky-100 text-sky-700',
  completed: 'bg-emerald-100 text-emerald-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-rose-100 text-rose-700',
};

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const { dashboard } = useSelector((s) => s.admin);

  useEffect(() => {
    dispatch(fetchDashboard());
  }, [dispatch]);

  const stats = dashboard?.stats || {};

  const cards = [
    { label: 'Total Revenue', value: fmt(stats.revenue), icon: Wallet, color: 'bg-rose-500', suffix: 'earned (completed)' },
    { label: 'Total Orders', value: `${stats.orders || 0}`, icon: ShoppingCart, color: 'bg-amber-500', suffix: `${stats.pendingOrders || 0} pending · ${stats.todayOrders || 0} today` },
    { label: 'Products', value: `${stats.products || 0}`, icon: Package, color: 'bg-blue-500', suffix: `${stats.categories || 0} categories` },
    { label: 'Users', value: `${stats.users || 0}`, icon: Users, color: 'bg-emerald-500', suffix: 'registered accounts' },
  ];

  const weekly = dashboard?.weeklyOrders || [];
  const weekMap = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const k = d.toISOString().slice(0, 10);
    weekMap[k] = { label: d.toLocaleDateString('en-PK', { weekday: 'short' }), count: 0, total: 0 };
  }
  weekly.forEach((w) => {
    if (weekMap[w._id]) { weekMap[w._id].count = w.count; weekMap[w._id].total = w.total || 0; }
  });
  const week = Object.values(weekMap);
  const maxCount = Math.max(1, ...week.map((d) => d.count));
  const weekTotal = week.reduce((s, d) => s + d.total, 0);
  const topDay = week.reduce((a, b) => (b.count > a.count ? b : a), week[0]);

  const lowStock = dashboard?.lowStock || [];
  const recentOrders = dashboard?.recentOrders || [];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            {new Date().toLocaleDateString('en-PK', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-lg">
          <TrendingUp size={15} /> {fmt(weekTotal)} sales in last 7 days
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {cards.map((c, i) => (
          <div key={i} className="bg-white rounded-xl p-5 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg ${c.color} text-white flex items-center justify-center shrink-0`}>
              <c.icon size={22} />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-gray-500 truncate">{c.label}</p>
              <p className="text-2xl font-semibold">{c.value}</p>
              <p className="text-xs text-gray-400 truncate">{c.suffix}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Weekly orders chart */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-medium">Orders — Last 7 Days</h2>
            <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium">
              Best: {topDay?.label || '-'} ({topDay?.count || 0})
            </span>
          </div>
          <div className="flex items-end justify-between gap-2 sm:gap-4 h-40">
            {week.map((d) => (
              <div key={d.label} className="flex-1 flex flex-col items-center gap-1.5" title={`${d.count} order${d.count === 1 ? '' : 's'}`}>
                <span className="text-[10px] text-gray-500">{d.count > 0 ? d.count : ''}</span>
                <div className="w-full max-w-[44px] rounded-t-lg bg-[#0b4f86] transition-all" style={{ height: `${Math.max(d.count > 0 ? 6 : 2, (d.count / maxCount) * 100)}%` }} />
                <span className="text-[10px] font-medium text-gray-500">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent orders */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-medium mb-4">Recent Orders</h2>
          {recentOrders.length === 0 ? (
            <p className="text-gray-400 text-sm">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((o) => (
                <div key={o._id} className="flex justify-between items-center text-sm border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="font-medium truncate">#{String(o._id).slice(-6).toUpperCase()}</p>
                    <p className="text-gray-500 text-xs truncate">{o.customer?.name || 'Guest'}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold">{fmt(o.total)}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[o.status] || 'bg-gray-100 text-gray-600'}`}>
                      {o.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Low stock */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Layers size={17} className="text-gray-400" />
            <h2 className="font-medium">Low Stock</h2>
            {lowStock.length > 0 && (
              <span className="text-[10px] bg-rose-500 text-white px-2 py-0.5 rounded-full font-bold">{lowStock.length}</span>
            )}
          </div>
          {lowStock.length === 0 ? (
            <p className="text-gray-400 text-sm">All products well stocked</p>
          ) : (
            <div className="space-y-3">
              {lowStock.map((p) => (
                <div key={p._id} className="flex justify-between items-center text-sm border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{p.name}</p>
                    <p className="text-gray-400 text-xs">{p.category || ''}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-gray-400">{fmt(p.price)}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${p.stock <= 5 ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`} title={p.stock <= 5 ? 'Critical' : 'Low'}>
                      {p.stock} left
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending orders snapshot */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={17} className="text-gray-400" />
            <h2 className="font-medium">Quick Stats</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Pending Orders', value: fmt(stats.pendingOrders).replace('Rs ', ''), note: 'awaiting processing' },
              { label: "Today's Orders", value: fmt(stats.todayOrders).replace('Rs ', ''), note: 'placed today' },
              { label: 'Categories', value: `${stats.categories || 0}`, note: 'active categories' },
              { label: 'Revenue / Order', value: stats.orders ? fmt(Math.round(stats.revenue / stats.orders)) : 'Rs 0', note: 'average value (completed)' },
            ].map((s, i) => (
              <div key={i} className="border border-gray-100 rounded-xl p-4">
                <p className="text-xs text-gray-400">{s.label}</p>
                <p className="text-xl font-semibold mt-1">{s.value}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{s.note}</p>
              </div>
            ))}
          </div>
          {stats.pendingOrders > 0 && (
            <div className="mt-4 flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-lg p-3 text-xs text-amber-800">
              <AlertTriangle size={14} className="shrink-0 mt-0.5" />
              <span>{stats.pendingOrders} order{stats.pendingOrders === 1 ? '' : 's'} need your attention — check the Orders page.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}