import { Outlet, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { LayoutDashboard, Package, ShoppingCart, LogOut, Store, Settings, FolderOpen, Menu, X, Megaphone, FileText } from 'lucide-react';
import { useState } from 'react';
import { ToastProvider } from '../../components/admin/Toast';

export default function AdminLayout() {
  const { user } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user || user.role !== 'admin') {
    return <Navigate to="/admin/v1/admin/login" replace />;
  }

  const nav = [
    { to: '/admin/v1/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { to: '/admin/v1/admin/products', label: 'Products', icon: Package },
    { to: '/admin/v1/admin/categories', label: 'Categories', icon: FolderOpen },
    { to: '/admin/v1/admin/orders', label: 'Orders', icon: ShoppingCart },
    { to: '/admin/v1/admin/blogs', label: 'Blog', icon: FileText },
    { to: '/admin/v1/admin/settings', label: 'Site Settings', icon: Settings },
    { to: '/admin/v1/admin/popups', label: 'Popups', icon: Megaphone },
  ];

  const isActive = (item) =>
    item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to);

  const Sidebar = () => (
    <>
      <div className="p-5 border-b">
        <h1 className="text-lg font-semibold">Raftar Admin</h1>
        <p className="text-xs text-gray-500 mt-0.5 truncate">{user.email}</p>
      </div>
      <nav className="flex-1 p-3 space-y-0.5">
        {nav.map(item => (
          <Link key={item.to} to={item.to} onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
              isActive(item) ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}>
            <item.icon size={18} /> {item.label}
          </Link>
        ))}
        <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">
          <Store size={18} /> View Store
        </Link>
      </nav>
      <div className="p-3 border-t">
        <button onClick={() => { dispatch(logout()); navigate('/admin/v1/admin/login'); }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 w-full">
          <LogOut size={18} /> Logout
        </button>
      </div>
    </>
  );

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-100 flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 bg-white border-r flex-col shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-white flex flex-col shadow-xl">
            <button className="absolute top-4 right-4 p-1" onClick={() => setSidebarOpen(false)}><X size={20} /></button>
            <Sidebar />
          </aside>
        </div>
      )}

      <main className="flex-1 overflow-auto min-w-0 w-full">
        <div className="md:hidden sticky top-0 z-40 bg-white border-b px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="p-1"><Menu size={22} /></button>
          <span className="font-medium text-sm">Admin</span>
        </div>
        <div className="p-4 sm:p-6 lg:p-8"><Outlet /></div>
      </main>
      </div>
    </ToastProvider>
  );
}
