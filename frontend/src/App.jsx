import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import CartDrawer from './components/layout/CartDrawer';
import NewsletterPopup from './components/layout/NewsletterPopup';
import SalesNotification from './components/layout/SalesNotification';
import ExitPopup from './components/layout/ExitPopup';
import MobileTabBar from './components/layout/MobileTabBar';
import ScrollToTop from './components/layout/ScrollToTop';
import FloatingWhatsApp from './components/layout/FloatingWhatsApp';
import FaviconSync from './components/layout/FaviconSync';

// Route pages are code-split so the initial bundle stays small and the first
// page paints fast; each page loads only when its route is opened.
const Home = lazy(() => import('./pages/Home'));
const Shop = lazy(() => import('./pages/Shop'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Manufacturing = lazy(() => import('./pages/Manufacturing'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminProducts = lazy(() => import('./pages/admin/Products'));
const AdminOrders = lazy(() => import('./pages/admin/Orders'));
const AdminLogin = lazy(() => import('./pages/admin/Login'));
const AdminSettings = lazy(() => import('./pages/admin/Settings'));
const AdminHomeSections = lazy(() => import('./pages/admin/HomeSections'));
const AdminCategories = lazy(() => import('./pages/admin/Categories'));
const AdminPopups = lazy(() => import('./pages/admin/Popups'));
const AdminPayments = lazy(() => import('./pages/admin/Payments'));
const AdminBlogs = lazy(() => import('./pages/admin/Blogs'));

function PageFallback() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-9 h-9 border-2 border-gray-200 border-t-[#0b4f86] rounded-full animate-spin" />
    </div>
  );
}

function lazyPage(Comp) {
  return function LazyPage(props) {
    return (
      <Suspense fallback={<PageFallback />}>
        <Comp {...props} />
      </Suspense>
    );
  };
}

const HomePage = lazyPage(Home);
const ShopPage = lazyPage(Shop);
const ProductDetailPage = lazyPage(ProductDetail);
const AboutPage = lazyPage(About);
const ContactPage = lazyPage(Contact);
const NotFoundPage = lazyPage(NotFound);
const ManufacturingPage = lazyPage(Manufacturing);
const BlogPage = lazyPage(Blog);
const BlogPostPage = lazyPage(BlogPost);
const WishlistPage = lazyPage(Wishlist);
const AdminLayoutPage = lazyPage(AdminLayout);
const AdminLoginPage = lazyPage(AdminLogin);
const AdminDashboardPage = lazyPage(AdminDashboard);
const AdminProductsPage = lazyPage(AdminProducts);
const AdminOrdersPage = lazyPage(AdminOrders);
const AdminSettingsPage = lazyPage(AdminSettings);
const AdminHomeSectionsPage = lazyPage(AdminHomeSections);
const AdminCategoriesPage = lazyPage(AdminCategories);
const AdminPopupsPage = lazyPage(AdminPopups);
const AdminPaymentsPage = lazyPage(AdminPayments);
const AdminBlogsPage = lazyPage(AdminBlogs);

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
      <FaviconSync />
      <ScrollToTop />
      <Routes>
      <Route path="/" element={<StoreLayout><HomePage /></StoreLayout>} />
      <Route path="/shop" element={<StoreLayout><ShopPage /></StoreLayout>} />
      <Route path="/product/:slug" element={<StoreLayout><ProductDetailPage /></StoreLayout>} />
      <Route path="/collections/:category" element={<StoreLayout><ShopPage /></StoreLayout>} />
      <Route path="/about" element={<StoreLayout><AboutPage /></StoreLayout>} />
      <Route path="/contact" element={<StoreLayout><ContactPage /></StoreLayout>} />
      <Route path="/manufacturing" element={<StoreLayout><ManufacturingPage /></StoreLayout>} />
      <Route path="/blog" element={<StoreLayout><BlogPage /></StoreLayout>} />
      <Route path="/blog/:slug" element={<StoreLayout><BlogPostPage /></StoreLayout>} />
      <Route path="/wishlist" element={<StoreLayout><WishlistPage /></StoreLayout>} />

      <Route path="/admin/v1/dashboard/login" element={<AdminLoginPage />} />
      <Route path="/admin/v1/dashboard" element={<AdminLayoutPage />}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="payments" element={<AdminPaymentsPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
        <Route path="settings/home-sections" element={<AdminHomeSectionsPage />} />
        <Route path="popups" element={<AdminPopupsPage />} />
        <Route path="blogs" element={<AdminBlogsPage />} />
      </Route>

      <Route path="*" element={<StoreLayout><NotFoundPage /></StoreLayout>} />
    </Routes>
    </>
  );
}