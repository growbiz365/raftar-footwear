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
    image: 'https://res.cloudinary.com/dj5hgapcp/image/upload/v1788771606/raftar-footwear/hero-image-final.png.png',
    buttonText: 'Subscribe',
    delaySeconds: 4,
    couponCode: 'FIRST10'
  },
  salesPopup: {
    enabled: true,
    intervalSeconds: 8,
    items: [
      { name: "Women's Buckle Slide", city: 'Peshawar', time: '12 Minutes Ago', img: 'https://res.cloudinary.com/dj5hgapcp/image/upload/v1788771590/raftar-footwear/article-019-brown.webp.webp' },
      { name: "Men's Cross-Strap Slide", city: 'Lahore', time: '28 Minutes Ago', img: 'https://res.cloudinary.com/dj5hgapcp/image/upload/v1788771596/raftar-footwear/article-815.webp.webp' },
      { name: 'Massage Flip-Flop', city: 'Karachi', time: '45 Minutes Ago', img: 'https://res.cloudinary.com/dj5hgapcp/image/upload/v1788771593/raftar-footwear/article-05.webp.webp' },
      { name: "Men's Sports Slide", city: 'Islamabad', time: '1 Hour Ago', img: 'https://res.cloudinary.com/dj5hgapcp/image/upload/v1788771587/raftar-footwear/article-017.webp.webp' }
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
    title: 'Wholesale Special',
    message: 'Order bulk packs of 6 or 12 pairs and get dealer pricing. Contact us on WhatsApp!',
    buttonText: 'Order Bulk Now',
    redirectUrl: 'https://wa.me/923338788861',
    image: '',
    delayMs: 2500
  },
  promoBar: '★ Quality Footwear, Every Step of the Way. | Wholesale Packs: 1 · 6 · 12 pairs'
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
