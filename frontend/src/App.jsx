import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import CartDrawer from './components/layout/CartDrawer';
import NewsletterPopup from './components/layout/NewsletterPopup';
import SalesNotification from './components/layout/SalesNotification';
import ExitPopup from './components/layout/ExitPopup';
import MobileTabBar from './components/layout/MobileTabBar';
import ScrollToTop from './components/layout/ScrollToTop';
import FloatingWhatsApp from './components/layout/FloatingWhatsApp';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import About from './pages/About';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
import Manufacturing from './pages/Manufacturing';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Wishlist from './pages/Wishlist';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminOrders from './pages/admin/Orders';
import AdminLogin from './pages/admin/Login';
import AdminSettings from './pages/admin/Settings';
import AdminHomeSections from './pages/admin/HomeSections';
import AdminCategories from './pages/admin/Categories';
import AdminPopups from './pages/admin/Popups';
import AdminBlogs from './pages/admin/Blogs';

function StoreLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <Footer />
      <CartDrawer />
      <NewsletterPopup />
      <SalesNotification />
      <ExitPopup />
      <MobileTabBar />
      <FloatingWhatsApp />
    </div>
  );
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
      <Route path="/" element={<StoreLayout><Home /></StoreLayout>} />
      <Route path="/shop" element={<StoreLayout><Shop /></StoreLayout>} />
      <Route path="/product/:slug" element={<StoreLayout><ProductDetail /></StoreLayout>} />
      <Route path="/collections/:category" element={<StoreLayout><Shop /></StoreLayout>} />
      <Route path="/about" element={<StoreLayout><About /></StoreLayout>} />
      <Route path="/contact" element={<StoreLayout><Contact /></StoreLayout>} />
      <Route path="/manufacturing" element={<StoreLayout><Manufacturing /></StoreLayout>} />
      <Route path="/blog" element={<StoreLayout><Blog /></StoreLayout>} />
      <Route path="/blog/:slug" element={<StoreLayout><BlogPost /></StoreLayout>} />
      <Route path="/wishlist" element={<StoreLayout><Wishlist /></StoreLayout>} />

      <Route path="/admin" element={<Navigate to="/admin/v1/admin" replace />} />
      <Route path="/admin/login" element={<Navigate to="/admin/v1/admin/login" replace />} />
      <Route path="/admin/v1/admin/login" element={<AdminLogin />} />
      <Route path="/admin/v1/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="settings/home-sections" element={<AdminHomeSections />} />
        <Route path="popups" element={<AdminPopups />} />
        <Route path="blogs" element={<AdminBlogs />} />
      </Route>

      <Route path="*" element={<StoreLayout><NotFound /></StoreLayout>} />
    </Routes>
    </>
  );
}
