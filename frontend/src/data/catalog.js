/**
 * Static seed catalog – real images & content from https://raftarfootwear.com/
 * Used as fallback when API/backend is unavailable + merged with localStorage admin products.
 */

export const IMG = {
  logo: 'https://res.cloudinary.com/dj5hgapcp/image/upload/v1788771608/raftar-footwear/logo.webp.webp',
  hero: 'https://res.cloudinary.com/dj5hgapcp/image/upload/v1788771606/raftar-footwear/hero-image-final.png.png',
  factory: 'https://res.cloudinary.com/dj5hgapcp/image/upload/v1788771605/raftar-footwear/factory-image-e1785482188113.webp.webp',
  article019brown: 'https://res.cloudinary.com/dj5hgapcp/image/upload/v1788771590/raftar-footwear/article-019-brown.webp.webp',
  article815: 'https://res.cloudinary.com/dj5hgapcp/image/upload/v1788771596/raftar-footwear/article-815.webp.webp',
  article05: 'https://res.cloudinary.com/dj5hgapcp/image/upload/v1788771593/raftar-footwear/article-05.webp.webp',
  article019black: 'https://res.cloudinary.com/dj5hgapcp/image/upload/v1788771588/raftar-footwear/article-019-black.webp.webp',
  article017: 'https://res.cloudinary.com/dj5hgapcp/image/upload/v1788771587/raftar-footwear/article-017.webp.webp',
  article011: 'https://res.cloudinary.com/dj5hgapcp/image/upload/v1788771586/raftar-footwear/article-011.webp.webp',
  article025: 'https://res.cloudinary.com/dj5hgapcp/image/upload/v1788771591/raftar-footwear/article-025.webp.webp',
  article291: 'https://res.cloudinary.com/dj5hgapcp/image/upload/v1788771595/raftar-footwear/article-291.webp.webp',
  article027: 'https://res.cloudinary.com/dj5hgapcp/image/upload/v1788771592/raftar-footwear/article-027.webp.webp',
  articleWoven: 'https://res.cloudinary.com/dj5hgapcp/image/upload/v1788771597/raftar-footwear/article-woven.webp.webp',
};

const pack = (unit) => ({
  1: unit,
  6: Math.round(unit * 6 * 0.95),
  12: Math.round(unit * 12 * 0.9),
});

export const STATIC_PRODUCTS = [
  {
    _id: 'static-1',
    name: "Women's Buckle Slide",
    slug: 'womens-buckle-slide',
    price: 220,
    packPrices: pack(220),
    compareAtPrice: null,
    images: [IMG.article019brown],
    colors: ['Brown', 'Tan'],
    colorVariants: [
      { name: 'Brown', hex: '#8B4513', image: IMG.article019brown },
      { name: 'Tan', hex: '#D2B48C', image: IMG.article019brown },
    ],
    sizes: ['13/5'],
    brand: 'raftar',
    category: 'Women',
    tags: ['Best Seller', 'Footwear', 'Wholesale'],
    description: "Women's buckle slide chappal. Article 019. Comfortable plastic footwear for daily use. Ideal for wholesalers & dealers. Size 13/5.",
    article: '019',
    stock: 500,
    rating: 4.8,
    reviews: 45,
    featured: true,
    isWholesale: true,
    isActive: true,
  },
  {
    _id: 'static-2',
    name: "Men's Cross-Strap Slide",
    slug: 'mens-cross-strap-slide',
    price: 400,
    packPrices: pack(400),
    images: [IMG.article815],
    colors: ['Black', 'Brown'],
    colorVariants: [
      { name: 'Black', hex: '#111111', image: IMG.article815 },
      { name: 'Brown', hex: '#5C4033', image: IMG.article815 },
    ],
    sizes: ['7/10'],
    brand: 'raftar',
    category: 'Men',
    tags: ['Best Seller', 'Footwear'],
    description: "Men's cross-strap slide. Article 815. Premium PVC design for comfort and durability. Size 7/10.",
    article: '815',
    stock: 400,
    rating: 4.7,
    reviews: 62,
    featured: true,
    isWholesale: true,
    isActive: true,
  },
  {
    _id: 'static-3',
    name: 'Massage Flip-Flop',
    slug: 'massage-flip-flop',
    price: 400,
    packPrices: pack(400),
    images: [IMG.article05],
    colors: ['Blue', 'Black'],
    colorVariants: [
      { name: 'Blue', hex: '#1E3A8A', image: IMG.article05 },
      { name: 'Black', hex: '#111111', image: IMG.article05 },
    ],
    sizes: ['7/10'],
    brand: 'raftar',
    category: 'Men',
    tags: ['Trending', 'Footwear'],
    description: 'Massage flip-flop with ergonomic sole. Article 05. Excellent for daily wear. Size 7/10.',
    article: '05',
    stock: 350,
    rating: 4.9,
    reviews: 38,
    featured: true,
    isWholesale: true,
    isActive: true,
  },
  {
    _id: 'static-4',
    name: 'Black Buckle Slide',
    slug: 'black-buckle-slide',
    price: 320,
    packPrices: pack(320),
    images: [IMG.article019black],
    colors: ['Black'],
    colorVariants: [{ name: 'Black', hex: '#111111', image: IMG.article019black }],
    sizes: ['6/9'],
    brand: 'raftar',
    category: 'Women',
    tags: ['Footwear'],
    description: 'Black buckle slide. Article 019. Durable PCU material. Size 6/9.',
    article: '019',
    stock: 450,
    rating: 4.6,
    reviews: 29,
    featured: true,
    isWholesale: true,
    isActive: true,
  },
  {
    _id: 'static-5',
    name: "Men's Sports Slide",
    slug: 'mens-sports-slide',
    price: 200,
    packPrices: pack(200),
    compareAtPrice: 250,
    images: [IMG.article017],
    colors: ['Black', 'Gray'],
    colorVariants: [
      { name: 'Black', hex: '#111111', image: IMG.article017 },
      { name: 'Gray', hex: '#6B7280', image: IMG.article017 },
    ],
    sizes: ['7/10'],
    brand: 'superstar',
    category: 'Men',
    tags: ['Sale', 'Sports', 'Footwear'],
    description: "Men's sports slide. Article 017. Lightweight and durable. Perfect for sports & casual. Size 7/10.",
    article: '017',
    stock: 600,
    rating: 4.5,
    reviews: 55,
    featured: true,
    isWholesale: true,
    isActive: true,
  },
  {
    _id: 'static-6',
    name: 'White Sports Slide',
    slug: 'white-sports-slide',
    price: 200,
    packPrices: pack(200),
    images: [IMG.article011],
    colors: ['White'],
    colorVariants: [{ name: 'White', hex: '#FFFFFF', image: IMG.article011 }],
    sizes: ['7/10'],
    brand: 'superstar',
    category: 'Men',
    tags: ['Sports', 'Footwear'],
    description: 'White sports slide. Article 011. Clean look for everyday wear. Size 7/10.',
    article: '011',
    stock: 550,
    rating: 4.4,
    reviews: 41,
    featured: true,
    isWholesale: true,
    isActive: true,
  },
  {
    _id: 'static-7',
    name: "Children's Closed Clog",
    slug: 'childrens-closed-clog',
    price: 210,
    packPrices: pack(210),
    images: [IMG.article025],
    colors: ['Multi'],
    colorVariants: [{ name: 'Multi', hex: '#F59E0B', image: IMG.article025 }],
    sizes: ['2/9'],
    brand: 'raftar',
    category: 'Children',
    tags: ['Kids', 'Footwear'],
    description: "Children's closed clog. Comfortable and safe for kids. Article 025. Size 2/9.",
    article: '025',
    stock: 300,
    rating: 4.7,
    reviews: 22,
    featured: true,
    isWholesale: true,
    isActive: true,
  },
  {
    _id: 'static-8',
    name: 'Woven Strap Chappal',
    slug: 'woven-strap-chappal',
    price: 280,
    packPrices: pack(280),
    images: [IMG.articleWoven],
    colors: ['Brown', 'Natural'],
    colorVariants: [
      { name: 'Brown', hex: '#8B4513', image: IMG.articleWoven },
      { name: 'Natural', hex: '#DEB887', image: IMG.articleWoven },
    ],
    sizes: ['7/10'],
    brand: 'raftar',
    category: 'Chappals',
    tags: ['Chappal', 'Footwear'],
    description: 'Traditional woven strap chappal. Durable PCU construction. Ideal for bulk orders.',
    article: 'WOVEN',
    stock: 280,
    rating: 4.6,
    reviews: 33,
    featured: false,
    isWholesale: true,
    isActive: true,
  },
  {
    _id: 'static-9',
    name: 'Classic Slide 027',
    slug: 'classic-slide-027',
    price: 250,
    packPrices: pack(250),
    images: [IMG.article027],
    colors: ['Black', 'Navy'],
    colorVariants: [
      { name: 'Black', hex: '#111111', image: IMG.article027 },
      { name: 'Navy', hex: '#1E3A5F', image: IMG.article027 },
    ],
    sizes: ['7/10'],
    brand: 'superstar',
    category: 'Slides',
    tags: ['Slides', 'Footwear'],
    description: 'Classic slide Article 027. Reliable everyday footwear for dealers & distributors.',
    article: '027',
    stock: 420,
    rating: 4.5,
    reviews: 27,
    featured: false,
    isWholesale: true,
    isActive: true,
  },
  {
    _id: 'static-10',
    name: 'Premium Strap 291',
    slug: 'premium-strap-291',
    price: 350,
    packPrices: pack(350),
    images: [IMG.article291],
    colors: ['Black', 'Brown'],
    colorVariants: [
      { name: 'Black', hex: '#111111', image: IMG.article291 },
      { name: 'Brown', hex: '#5C4033', image: IMG.article291 },
    ],
    sizes: ['7/10'],
    brand: 'raftar',
    category: 'Men',
    tags: ['Premium', 'Footwear'],
    description: 'Premium strap design Article 291. High quality plastic footwear for wholesale.',
    article: '291',
    stock: 200,
    rating: 4.8,
    reviews: 19,
    featured: true,
    isWholesale: true,
    isActive: true,
  },
];

export const STATIC_CATEGORIES = [
  { _id: 'cat-1', name: 'Women', slug: 'women', image: IMG.article019brown, count: 2, order: 1 },
  { _id: 'cat-2', name: 'Men', slug: 'men', image: IMG.article815, count: 5, order: 2 },
  { _id: 'cat-3', name: 'Children', slug: 'children', image: IMG.article025, count: 1, order: 3 },
  { _id: 'cat-4', name: 'Slides', slug: 'slides', image: IMG.article017, count: 4, order: 4 },
  { _id: 'cat-5', name: 'Chappals', slug: 'chappals', image: IMG.articleWoven, count: 1, order: 5 },
  { _id: 'cat-6', name: 'Raftar Footwear', slug: 'raftar', image: IMG.article019brown, count: 7, order: 6 },
  { _id: 'cat-7', name: 'Superstar Footwear', slug: 'superstar', image: IMG.article011, count: 3, order: 7 },
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
        image: IMG.factory,
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
    image: '',
    delayMs: 2500,
  },
  exclusiveBanner: {
    badge: 'Wholesale Special',
    title: 'Bulk Orders Welcome',
    subtitle: 'Pack sizes 1, 6 & 12 pairs with attractive dealer rates',
    buttonText: 'Contact for Rates',
    image: IMG.factory,
  },
  classySection: {
    title: 'Raftar Footwear',
    titleLine2: 'Enterprises',
    text: 'Trusted manufacturer of plastic chappal and footwear in Peshawar. Specializing in PCU and PVC standard products designed for comfort, durability and everyday use.',
    buttonText: 'About Us',
    image: IMG.factory,
  },
};

const LOCAL_KEY = 'raftar_admin_products';
const LOCAL_BLOG_KEY = 'raftar_admin_blogs';
const LOCAL_SETTINGS_KEY = 'raftar_admin_settings';

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

export function getMergedProducts() {
  const local = getLocalProducts();
  const bySlug = new Map();
  STATIC_PRODUCTS.forEach((p) => bySlug.set(p.slug, p));
  local.forEach((p) => bySlug.set(p.slug, p));
  return Array.from(bySlug.values()).filter((p) => p.isActive !== false);
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
