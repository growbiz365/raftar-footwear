const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Setting = require('../models/Setting');
const Blog = require('../models/Blog');

// Cloudinary base (cloud: dj5hgapcp, folder: raftar-footwear) without version.
const C = 'https://res.cloudinary.com/dj5hgapcp/image/upload/raftar-footwear';

const IMG = {
  logo: '/images/raftar-logo.jpg',
  hero: `${C}/Chappal/01/1.jpg`,
  hero2: `${C}/Multiple%202/01/1.jpg`,
  banner: `${C}/Panjadara/01/1.jpg`,
  classy: `${C}/3trple%20Gir/01/2.jpg`,
  popup: `${C}/Boot/01/1.jpg`,
};

async function seed() {
  try {
    const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    const adminPassword = (process.env.ADMIN_PASSWORD || '').trim();

    if (adminEmail && adminPassword) {
      const adminExists = await User.findOne({ email: adminEmail });
      if (!adminExists) {
        await User.create({
          name: 'Admin',
          email: adminEmail,
          password: adminPassword,
          role: 'admin'
        });
        console.log(`✅ Admin user created (${adminEmail}) — password set from env`);
      }
    } else {
      console.warn('⚠️  ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping admin creation.');
    }

    // Seed default categories only when the collection is empty
    const catCount = await Category.countDocuments();
    if (catCount === 0) {
      await Category.insertMany([
        { name: 'Slides', slug: 'slides', image: `${C}/01/1.jpg`, count: 7, order: 1 },
        { name: 'Chappals', slug: 'chappals', image: `${C}/Chappal/01/1.jpg`, count: 2, order: 2 },
        { name: 'Boots', slug: 'boots', image: `${C}/Boot/01/1.jpg`, count: 5, order: 3 },
        { name: 'Chappali Boots', slug: 'chappali-boots', image: `${C}/Chappali%20Boot/06/1.jpg`, count: 3, order: 4 },
        { name: 'Panjadara', slug: 'panjadara', image: `${C}/Panjadara/01/1.jpg`, count: 4, order: 5 },
        { name: '3trple Gir', slug: '3trple-gir', image: `${C}/3trple%20Gir/01/2.jpg`, count: 2, order: 6 },
        { name: 'Multiple', slug: 'multiple', image: `${C}/Multiple/01/1.jpg`, count: 7, order: 7 },
        { name: 'Multiple 2', slug: 'multiple-2', image: `${C}/Multiple%202/01/1.jpg`, count: 9, order: 8 }
      ]);
      console.log('✅ Categories seeded');
    }

    // Seed default products only when the collection is empty
    const prodCount = await Product.countDocuments();
    if (prodCount === 0) {
      await Product.insertMany([
        {
          name: "Women's Buckle Slide",
          slug: 'womens-buckle-slide',
          price: 220, compareAtPrice: null,
          images: [],
          colors: ['Brown', 'Tan'], sizes: ['13/5'],
          category: 'Women', tags: ['Sale', 'Best Seller', 'Footwear'], featured: true,
          description: 'Women\'s buckle slide chappal. Article 019. Comfortable plastic footwear for daily use. Size 13/5.',
          stock: 100, rating: 4.8, reviews: 45
        },
        {
          name: "Men's Cross-Strap Slide",
          slug: 'mens-cross-strap-slide',
          price: 400, compareAtPrice: null,
          images: [],
          colors: ['Black', 'Brown'], sizes: ['7/10'],
          category: 'Men', tags: ['Best Seller', 'Footwear'], featured: true,
          description: 'Men\'s cross-strap slide. Article 815. Premium PVC design. Size 7/10.',
          stock: 80, rating: 4.7, reviews: 62
        },
        {
          name: 'Massage Flip-Flop',
          slug: 'massage-flip-flop',
          price: 400, compareAtPrice: null,
          images: [],
          colors: ['Blue', 'Black'], sizes: ['7/10'],
          category: 'Men', tags: ['Footwear', 'Trending'], featured: true,
          description: 'Massage flip-flop with ergonomic sole. Article 05. Size 7/10.',
          stock: 60, rating: 4.9, reviews: 38
        },
        {
          name: 'Black Buckle Slide',
          slug: 'black-buckle-slide',
          price: 320, compareAtPrice: null,
          images: [],
          colors: ['Black'], sizes: ['6/9'],
          category: 'Women', tags: ['Footwear'], featured: true,
          description: 'Black buckle slide. Article 019. Size 6/9. Durable PCU material.',
          stock: 90, rating: 4.6, reviews: 29
        },
        {
          name: "Men's Sports Slide",
          slug: 'mens-sports-slide',
          price: 200, compareAtPrice: 250,
          images: [],
          colors: ['Black', 'Gray'], sizes: ['7/10'],
          category: 'Men', tags: ['Sale', 'Footwear', 'Sports'], featured: true,
          description: 'Men\'s sports slide. Article 017. Lightweight and durable. Size 7/10.',
          stock: 120, rating: 4.5, reviews: 55
        },
        {
          name: 'White Sports Slide',
          slug: 'white-sports-slide',
          price: 200, compareAtPrice: null,
          images: [],
          colors: ['White'], sizes: ['7/10'],
          category: 'Men', tags: ['Footwear', 'Sports'], featured: true,
          description: 'White sports slide. Article 011. Clean look for everyday wear. Size 7/10.',
          stock: 110, rating: 4.4, reviews: 41
        },
        {
          name: "Children's Closed Clog",
          slug: 'childrens-closed-clog',
          price: 210, compareAtPrice: null,
          images: [],
          colors: ['Multi'], sizes: ['2/9'],
          category: 'Children', tags: ['Footwear'], featured: true,
          description: 'Children\'s closed clog. Article 025. Safe and comfortable. Size 2/9.',
          stock: 70, rating: 4.7, reviews: 22
        },
        {
          name: "Children's Sports Slide",
          slug: 'childrens-sports-slide',
          price: 140, compareAtPrice: null,
          images: [],
          colors: ['Blue', 'Pink'], sizes: ['18/35'],
          category: 'Children', tags: ['Footwear', 'Sports'], featured: false,
          description: 'Children\'s sports slide. Article 291. Size 18/35.',
          stock: 85, rating: 4.5, reviews: 18
        },
        {
          name: "Men's Double-Strap Slide",
          slug: 'mens-double-strap-slide',
          price: 410, compareAtPrice: null,
          images: [],
          colors: ['Black', 'Brown'], sizes: ['7/10'],
          category: 'Men', tags: ['Best Seller', 'Footwear'], featured: true,
          description: 'Men\'s double-strap slide. Article 027. Premium comfort. Size 7/10.',
          stock: 50, rating: 4.8, reviews: 33
        },
        {
          name: 'Daily Use Woven Chappal',
          slug: 'daily-use-woven-chappal',
          price: 220, compareAtPrice: null,
          images: [],
          colors: ['Brown', 'Black'], sizes: ['8/11'],
          category: 'Chappals', tags: ['Footwear'], featured: true,
          description: 'Daily use woven chappal. Article 07. Traditional comfort. Size 8/11.',
          stock: 95, rating: 4.6, reviews: 47
        }
      ]);
      console.log('✅ Raftar product images seeded');
    }

    // Insert default settings ONLY if missing — never overwrite user edits
    const defaultSettings = {
      hero: {
        badge: 'RAFTAR FOOTWEAR',
        title: 'Quality Plastic',
        titleLine2: 'Footwear',
        subtitle: 'Premium plastic chappals and PVC footwear for wholesalers, dealers & distributors across Pakistan.',
        buttonText: 'Explore Products',
        buttonLink: '/shop',
        image: IMG.hero,
        bgColor: '#f8f5f0'
      },
      promoBar: '★ Quality Footwear, Every Step of the Way  •  Bulk Orders for Dealers & Distributors  •  PCU & PVC Standard Products',
      exclusiveBanner: {
        badge: 'Manufacturer',
        title: 'PCU & PVC Footwear',
        subtitle: 'Modern production in Peshawar — bulk supply for wholesalers',
        buttonText: 'View Products',
        image: IMG.banner
      },
      classySection: {
        title: 'Trusted Manufacturer',
        titleLine2: 'in Peshawar',
        text: 'Raftar Footwear Enterprises manufactures premium plastic chappals and PVC footwear for comfort, durability and everyday use.',
        buttonText: 'Shop Now',
        image: IMG.classy
      },
      logo: IMG.logo,
      siteName: 'Raftar Footwear',
      newsletterPopup: {
        enabled: true,
        title: 'ENJOY 10% OFF YOUR FIRST ORDER',
        subtitle: 'Stay Informed! Monthly Tips, Tracks and Discount.',
        image: IMG.hero2,
        buttonText: 'Subscribe',
        delaySeconds: 4,
        couponCode: 'FIRST10'
      },
      salesPopup: {
        enabled: true,
        intervalSeconds: 8,
        items: [
          { name: 'Chappal 01', city: 'Peshawar', time: '12 Minutes Ago', img: IMG.hero },
          { name: 'Multiple 2 01', city: 'Lahore', time: '28 Minutes Ago', img: IMG.hero2 },
          { name: 'Boot 01', city: 'Karachi', time: '45 Minutes Ago', img: IMG.popup },
          { name: 'Panjadara 01', city: 'Islamabad', time: '1 Hour Ago', img: IMG.banner }
        ]
      },
      exitPopup: {
        enabled: false,
        title: 'Wait! Before you leave...',
        subtitle: 'Get 15% off your first bulk order',
        buttonText: 'Claim Offer',
        couponCode: 'BULK15'
      }
    };
    for (const [key, value] of Object.entries(defaultSettings)) {
      await Setting.updateOne({ key }, { $setOnInsert: { key, value } }, { upsert: true });
    }

    console.log('✅ Settings seeded (defaults added only if missing)');
  
    const blogCount = await Blog.countDocuments();
    if (blogCount === 0) {
      await Blog.insertMany([
        {
          title: 'Why Wholesale Plastic Footwear Makes Sense',
          slug: 'why-wholesale-plastic-footwear',
          excerpt: 'Learn how dealers benefit from bulk PCU & PVC footwear from Peshawar manufacturers.',
          content: 'Raftar Footwear Enterprises supplies quality plastic chappals and slides across Pakistan. Our wholesale packs of 1, 6 and 12 pairs help dealers manage inventory efficiently while offering competitive prices.\n\nWe use reliable PCU and PVC materials designed for everyday comfort and durability.',
          coverImage: IMG.hero,
          tags: ['wholesale', 'footwear'],
          isPublished: true
        },
        {
          title: 'PCU vs PVC Footwear – What Dealers Should Know',
          slug: 'pcu-vs-pvc-footwear',
          excerpt: 'A quick guide to materials used in plastic chappals and slides.',
          content: 'PCU and PVC are the standard materials for affordable, durable plastic footwear in Pakistan. Raftar specializes in both, with strict quality control at our Peshawar facility.',
          coverImage: IMG.banner,
          tags: ['materials', 'guide'],
          isPublished: true
        }
      ]);
      console.log('✅ Blogs seeded');
    }

  } catch (err) {
    console.error('Seed error:', err.message);
  }
}

module.exports = seed;
