const Setting = require('../models/Setting');

const DEFAULTS = {
  hero: {
    badge: 'SINCE 2010',
    title: 'Timeless',
    titleLine2: 'Appeal',
    subtitle: 'Enjoy savings of up to 60% all month long',
    buttonText: 'Explore Now',
    buttonLink: '/shop',
    image: '/images/hero.svg',
    bgColor: '#f8f5f0'
  },
  promoBar: 'FREE SHIPPING ON ORDERS OVER $199  •  FLAT 50% ON SELECTED BRANDS',
  exclusiveBanner: {
    badge: 'Flat 20% OFF',
    title: 'Exclusive Collection',
    subtitle: 'Shop Party & Events for women and men',
    buttonText: 'Shop Collection',
    image: '/images/banner.svg'
  },
  classySection: {
    title: 'Classy Look For',
    titleLine2: 'The Modern Woman',
    text: "Don't miss to take a look at these trending products that are currently making waves in the market",
    buttonText: 'Shop Now',
    image: '/images/classy.svg'
  },
  newsletter: {
    title: 'ENJOY 10% OFF YOUR FIRST ORDER',
    subtitle: 'Stay Informed! Monthly Tips, Tracks and Discount.',
    image: '/images/newsletter.svg'
  },
  siteName: 'Raftar Footwear',
  newsletterPopup: {
    enabled: false,
    title: 'ENJOY 10% OFF YOUR FIRST ORDER',
    subtitle: 'Stay Informed! Monthly Tips, Tracks and Discount.',
    image: '',
    buttonText: 'Subscribe',
    delaySeconds: 4,
    couponCode: 'FIRST10'
  },
  salesPopup: {
    enabled: true,
    intervalSeconds: 8,
    items: [
      { name: "Women's Buckle Slide", city: 'Peshawar', time: '12 Minutes Ago', img: '' },
      { name: "Men's Cross-Strap Slide", city: 'Lahore', time: '28 Minutes Ago', img: '' },
      { name: 'Massage Flip-Flop', city: 'Karachi', time: '45 Minutes Ago', img: '' },
      { name: "Men's Sports Slide", city: 'Islamabad', time: '1 Hour Ago', img: '' }
    ]
  },
  exitPopup: {
    enabled: false,
    title: 'Wait! Before you leave...',
    subtitle: 'Get 15% off your first bulk order',
    buttonText: 'Claim Offer',
    couponCode: 'BULK15'
  },
  popup: {
    enabled: false,
    layout: 'showcase',
    delayMs: 4000,
    badge: 'Best Seller',
    images: [
      'https://res.cloudinary.com/dj5hgapcp/image/upload/v1789020705/revone/axrnstwvojvfeumi5eiq.jpg',
      'https://res.cloudinary.com/dj5hgapcp/image/upload/raftar-footwear/Boot/04/6.jpg',
      'https://res.cloudinary.com/dj5hgapcp/image/upload/raftar-footwear/01/2.jpg',
      'https://res.cloudinary.com/dj5hgapcp/image/upload/raftar-footwear/Chappali%20Boot/06/1.jpg'
    ],
    brand: 'Raftar',
    brandSub: 'FOOTWEAR',
    title: 'Wholesale Special',
    price: 'Rs. 1,250',
    rating: '4.8',
    reviews: '124 reviews',
    description: 'Comfortable, stylish and perfect for everyday wear. Wholesale packs include 6 or 12 pairs at special prices. Ideal for resellers and bulk buyers.',
    features: [
      { title: 'Comfortable Fit', text: 'Soft and lightweight' },
      { title: 'Durable Quality', text: 'Built for long use' },
      { title: 'Bulk Pricing', text: 'Best rates for wholesale' }
    ],
    packs: [
      { label: '6 Pairs', sub: 'Get special price' },
      { label: '12 Pairs', sub: 'Best value' }
    ],
    buttonText: 'Order Bulk Now',
    redirectUrl: 'https://wa.me/923338788861'
  },
  promoBar: '★ Quality Footwear, Every Step of the Way. | Wholesale Packs: 1 · 6 · 12 pairs',
  promoTiles: {
    eyebrow: 'Big offers on your favorite! 💖',
    title: 'Where Style Meets Comfort',
    tiles: [
      { title: "Women's Favorite Styles", subtitle: 'Upto 50% Off', cta: 'Shop Now', to: '/collections/women', img: 'https://res.cloudinary.com/dj5hgapcp/image/upload/raftar-footwear/Multiple/03/13.jpg' },
      { title: 'Say Hello To Slides', subtitle: 'Volume packs ready', cta: 'Shop Now', to: '/collections/slides', img: 'https://res.cloudinary.com/dj5hgapcp/image/upload/raftar-footwear/01/2.jpg' },
      { title: 'Big Buckle Styles', subtitle: 'Flat wholesale rates', cta: 'Shop Now', to: '/collections/raftar', img: 'https://res.cloudinary.com/dj5hgapcp/image/upload/raftar-footwear/Panjadara/03/7.jpg' },
      { title: 'Kids & Everyday', subtitle: 'Comfort first', cta: 'Shop Now', to: '/collections/children', img: 'https://res.cloudinary.com/dj5hgapcp/image/upload/raftar-footwear/05/1.jpg' }
    ]
  },
  saleCountdown: {
    badge: 'Limited time',
    title: 'Biggest sale of the year',
    subtitle: 'Shop before time runs out. Up to 70% OFF wholesale packs',
    buttonText: 'Shop Now',
    buttonLink: '/shop',
    bgImg: '',
    endDate: null
  },
  testimonials: {
    eyebrow: 'Happy Clients',
    title: 'We Work To Keep Dealers Happy',
    items: [
      { quote: 'True to size and durable for daily wear. Our customers reorder the Raftar slides every season.', name: 'Cory', city: 'Lahore', role: 'Fashion retailer' },
      { quote: 'Comfortable, stylish and great margins. Superstar packs move fast — easy WhatsApp reorders.', name: 'Herman', city: 'Peshawar', role: 'Regional stockist' },
      { quote: 'Ordered bulk for our store. Quality PVC and on-time delivery across Pakistan. Highly recommend.', name: 'Kylie', city: 'Karachi', role: 'Footwear store' }
    ]
  },
  shopBanners: {
    banners: [
      { eyebrow: 'Market Crash Prices!', line1: 'Step Into The', line2: 'Extraordinary', cta: 'Shop Women', link: '/collections/women', bgColor: '#0f172a', image: 'https://res.cloudinary.com/dj5hgapcp/image/upload/raftar-footwear/Chappali%20Boot/06/1.jpg' },
      { eyebrow: 'All time Best Seller', line1: 'Style That', line2: 'Moves You First', cta: 'Shop Men', link: '/collections/men', bgColor: '#1e293b', image: 'https://res.cloudinary.com/dj5hgapcp/image/upload/raftar-footwear/Boot/04/6.jpg' }
    ]
  },
  checkout: {
    whatsapp: '923338788861',
    codEnabled: true,
    onlineEnabled: true,
    note: 'Please pay the exact order amount and share your transaction screenshot below to verify your payment.',
    accounts: [
      { label: 'EasyPaisa', type: 'easypaisa', accountTitle: 'Raftar Footwear', accountNumber: '0300 1234567', bankName: '', note: 'Send money to this EasyPaisa number', active: true },
      { label: 'JazzCash', type: 'jazzcash', accountTitle: 'Raftar Footwear', accountNumber: '0300 7654321', bankName: '', note: 'Send money to this JazzCash number', active: true },
      { label: 'Bank Transfer', type: 'bank', accountTitle: 'Raftar Footwear Enterprises', accountNumber: '0000 0000 0000 0000 0000', bankName: 'Meezan Bank', note: 'Use the IBAN / account number above', active: true }
    ]
  }
};

exports.getSettings = async (req, res) => {
  try {
    const docs = await Setting.find().lean();
    const settings = { ...DEFAULTS };
    docs.forEach(d => { settings[d.key] = d.value; });
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getSetting = async (req, res) => {
  try {
    const doc = await Setting.findOne({ key: req.params.key }).lean();
    const value = doc ? doc.value : DEFAULTS[req.params.key] || null;
    res.json({ success: true, data: value });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateSetting = async (req, res) => {
  try {
    let value = req.body.value !== undefined ? req.body.value : req.body;
    if (req.uploadedUrl && typeof value === 'object') {
      value = { ...value, image: req.uploadedUrl };
    }
    const doc = await Setting.findOneAndUpdate(
      { key: req.params.key },
      { key: req.params.key, value },
      { upsert: true, new: true }
    );
    res.json({ success: true, data: doc.value });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
