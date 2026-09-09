const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');
const Category = require('../models/Category');
const cloudinary = require('../config/cloudinary');

exports.getDashboard = async (req, res) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(startOfToday.getTime() - 6 * 24 * 60 * 60 * 1000);

    const [products, users, orders, categories, revenueAgg, pendingAgg, todayAgg, weekly, recentOrders, lowStock] = await Promise.all([
      Product.countDocuments(),
      User.countDocuments(),
      Order.countDocuments(),
      Category.countDocuments(),
      Order.aggregate([
        { $match: { status: { $in: ['completed', 'delivered'] } } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Order.countDocuments({ status: { $in: ['pending', 'processing', 'new'] } }),
      Order.countDocuments({ createdAt: { $gte: startOfToday } }),
      Order.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
            total: { $sum: '$total' }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      Order.find().sort({ createdAt: -1 }).limit(5).lean(),
      Product.find({ stock: { $lt: 15 } }).sort({ stock: 1 }).limit(6).lean()
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          products,
          users,
          orders,
          categories,
          revenue: revenueAgg[0]?.total || 0,
          pendingOrders: pendingAgg,
          todayOrders: todayAgg
        },
        weeklyOrders: Array.isArray(weekly) ? weekly : [],
        recentOrders,
        lowStock
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// List Cloudinary footwear / product images
exports.listCloudinaryImages = async (req, res) => {
  try {
    const folder = req.query.folder || '';
    const result = await cloudinary.search
      .expression(folder ? `folder:${folder}` : 'resource_type:image')
      .sort_by('created_at', 'desc')
      .max_results(50)
      .execute();

    const images = (result.resources || []).map(r => ({
      url: r.secure_url,
      publicId: r.public_id,
      width: r.width,
      height: r.height,
      folder: r.folder
    }));
    res.json({ success: true, count: images.length, data: images });
  } catch (err) {
    // Fallback: list resources
    try {
      const result = await cloudinary.api.resources({ type: 'upload', max_results: 50 });
      const images = (result.resources || []).map(r => ({
        url: r.secure_url,
        publicId: r.public_id,
        width: r.width,
        height: r.height
      }));
      res.json({ success: true, count: images.length, data: images });
    } catch (e2) {
      res.status(500).json({ success: false, message: err.message || e2.message });
    }
  }
};
