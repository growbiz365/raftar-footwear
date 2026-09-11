/**
 * Static seed catalog.
 * Used as fallback when API/backend is unavailable + merged with localStorage admin products.
 * Product images are hosted on Cloudinary (cloud: dj5hgapcp, folder: raftar-footwear).
 */

// Cloudinary base without version (Cloudinary resolves versionless URLs to latest asset).
const C = 'https://res.cloudinary.com/dj5hgapcp/image/upload/raftar-footwear';

// Live dashboard hero image — used as the pre-settings fallback so the first
// paint matches what /api/settings returns (no hero flash).
const LIVE_HERO = 'https://res.cloudinary.com/dj5hgapcp/image/upload/v1789020705/revone/axrnstwvojvfeumi5eiq.jpg';

export const IMG = {
  logo: '/images/fixlogo.jpg',
  hero: LIVE_HERO,
  hero2: LIVE_HERO,
  banner: `${C}/Panjadara/01/1.jpg`,
  classy: `${C}/3trple%20Gir/01/2.jpg`,
  popup: `${C}/Boot/01/1.jpg`,
};

// Removed: the hardcoded fallback products used to live here. They were
// hardcoded (not in the DB), so they kept reappearing on the storefront even
// after being deleted. The shop now shows only database products (or admin
// products stored locally).
export const STATIC_PRODUCTS = [];

export const STATIC_CATEGORIES = [
  { _id: 'cat-1', name: 'Slides', slug: 'slides', image: `${C}/01/1.jpg`, count: 0, order: 1 },
  { _id: 'cat-2', name: 'Chappals', slug: 'chappals', image: `${C}/Chappal/01/1.jpg`, count: 0, order: 2 },
  { _id: 'cat-3', name: 'Boots', slug: 'boots', image: `${C}/Boot/01/1.jpg`, count: 0, order: 3 },
  { _id: 'cat-4', name: 'Chappali Boots', slug: 'chappali-boots', image: `${C}/Chappali%20Boot/06/1.jpg`, count: 0, order: 4 },
  { _id: 'cat-5', name: 'Panjadara', slug: 'panjadara', image: `${C}/Panjadara/01/1.jpg`, count: 0, order: 5 },
  { _id: 'cat-6', name: '3trple Gir', slug: '3trple-gir', image: `${C}/3trple%20Gir/01/2.jpg`, count: 0, order: 6 },
  { _id: 'cat-7', name: 'Multiple', slug: 'multiple', image: `${C}/Multiple/01/1.jpg`, count: 0, order: 7 },
  { _id: 'cat-8', name: 'Multiple 2', slug: 'multiple-2', image: `${C}/Multiple%202/01/1.jpg`, count: 0, order: 8 },
];

export const STATIC_SETTINGS = {
  promoBar: '★ Quality Footwear, Every Step of the Way. | Wholesale Packs: 1 · 6 · 12 pairs',
  phone: '03338788861',
  whatsapp: '923338788861',
  email: 'info@raftarfootwear.com',
  address: 'Plot # 70B, Near Masjid Qasim, Small Industrial Estate, Kohat Road, Peshawar.',
  hero: {
    badge: 'PLASTIC FOOTWEAR MANUFACTURER',
    title: 'Quality Plastic',
    titleLine2: 'Footwear in Peshawar',
    subtitle: 'Premium PCU & PVC chappals and footwear for wholesalers, dealers & distributors across Pakistan.',
    buttonText: 'Explore Products',
    buttonLink: '/shop',
    image: IMG.hero,
    bgColor: '#f0f7fc',
    slides: [
      {
        badge: 'PLASTIC FOOTWEAR MANUFACTURER',
        title: 'Quality Plastic',
        titleLine2: 'Footwear in Peshawar',
        subtitle: 'Premium PCU & PVC chappals and footwear for wholesalers, dealers & distributors across Pakistan.',
        buttonText: 'Explore Products',
        buttonLink: '/shop',
        image: IMG.hero,
        bgColor: '#f0f7fc',
      },
      {
        badge: 'WHOLESALE READY',
        title: 'Bulk Packs',
        titleLine2: '1 · 6 · 12 Pairs',
        subtitle: 'Dealer pricing for volume orders. Order bulk now via WhatsApp.',
        buttonText: 'Order Bulk Now',
        buttonLink: 'https://wa.me/923338788861',
        image: IMG.hero2,
        bgColor: '#eef6f1',
      },
    ],
  },
  popup: {
    enabled: false,
    title: 'Wholesale Special',
    message: 'Order bulk packs of 6 or 12 pairs and get dealer pricing.',
    buttonText: 'Order Bulk Now',
    redirectUrl: 'https://wa.me/923338788861',
    image: IMG.popup,
    delayMs: 2500,
  },
  exclusiveBanner: {
    badge: 'Wholesale Special',
    title: 'Bulk Orders Welcome',
    subtitle: 'Pack sizes 1, 6 & 12 pairs with attractive dealer rates',
    buttonText: 'Contact for Rates',
    image: IMG.banner,
  },
  classySection: {
    title: 'Raftar Footwear',
    titleLine2: 'Enterprises',
    text: 'Trusted manufacturer of plastic chappal and footwear in Peshawar. Specializing in PCU and PVC standard products designed for comfort, durability and everyday use.',
    buttonText: 'About Us',
    image: IMG.classy,
  },
};

const LOCAL_KEY = 'raftar_admin_products';
const LOCAL_BLOG_KEY = 'raftar_admin_blogs';
const LOCAL_SETTINGS_KEY = 'raftar_admin_settings';
const DELETED_KEY = 'raftar_deleted_products';

export function getLocalProducts() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveLocalProducts(products) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(products));
}

// IDs of products the admin has deleted. Used so deleted (incl. static seed)
// products do NOT reappear on the storefront.
export function getDeletedProductIds() {
  try {
    return JSON.parse(localStorage.getItem(DELETED_KEY) || '[]');
  } catch {
    return [];
  }
}

export function getMergedProducts() {
  const local = getLocalProducts();
  const deleted = new Set(getDeletedProductIds());
  const bySlug = new Map();
  STATIC_PRODUCTS.forEach((p) => bySlug.set(p.slug, p));
  local.forEach((p) => bySlug.set(p.slug, p));
  return Array.from(bySlug.values()).filter((p) => p.isActive !== false && !deleted.has(p._id));
}

export function getLocalBlogs() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_BLOG_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveLocalBlogs(blogs) {
  localStorage.setItem(LOCAL_BLOG_KEY, JSON.stringify(blogs));
}

export function getLocalSettings() {
  try {
    return { ...STATIC_SETTINGS, ...JSON.parse(localStorage.getItem(LOCAL_SETTINGS_KEY) || '{}') };
  } catch {
    return STATIC_SETTINGS;
  }
}

export function saveLocalSettings(settings) {
  localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(settings));
}
