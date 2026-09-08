const Product = require('../models/Product');
const Category = require('../models/Category');

function parseBody(body) {
  const data = { ...body };
  if (typeof data.colors === 'string') {
    if (data.colors.trim().startsWith('[')) {
      try { data.colors = JSON.parse(data.colors); } catch { data.colors = data.colors.split(',').map(s => s.trim()).filter(Boolean); }
    } else {
      data.colors = data.colors.split(',').map(s => s.trim()).filter(Boolean);
    }
  }
  if (typeof data.sizes === 'string') {
    if (data.sizes.trim().startsWith('[')) {
      try { data.sizes = JSON.parse(data.sizes); } catch { data.sizes = data.sizes.split(',').map(s => s.trim()).filter(Boolean); }
    } else {
      data.sizes = data.sizes.split(',').map(s => s.trim()).filter(Boolean);
    }
  }
  if (typeof data.tags === 'string') {
    if (data.tags.trim().startsWith('[')) {
      try { data.tags = JSON.parse(data.tags); } catch { data.tags = data.tags.split(',').map(s => s.trim()).filter(Boolean); }
    } else {
      data.tags = data.tags.split(',').map(s => s.trim()).filter(Boolean);
    }
  }
  if (typeof data.images === 'string') {
    if (data.images.trim().startsWith('[')) {
      try { data.images = JSON.parse(data.images); } catch { data.images = data.images.split(',').map(s => s.trim()).filter(Boolean); }
    } else {
      data.images = data.images.split(',').map(s => s.trim()).filter(Boolean);
    }
  }
  if (typeof data.colorVariants === 'string') {
    try { data.colorVariants = JSON.parse(data.colorVariants); } catch { data.colorVariants = []; }
  }
  if (typeof data.packPrices === 'string') {
    try { data.packPrices = JSON.parse(data.packPrices); } catch { /* keep string */ }
  }
  if (typeof data.price === 'string') data.price = parseFloat(data.price);
  if (typeof data.compareAtPrice === 'string') data.compareAtPrice = data.compareAtPrice ? parseFloat(data.compareAtPrice) : null;
  if (typeof data.stock === 'string') data.stock = parseInt(data.stock) || 0;
  if (data.featured === 'true' || data.featured === true) data.featured = true;
  else if (data.featured === 'false') data.featured = false;
  if (data.isWholesale === 'true' || data.isWholesale === true) data.isWholesale = true;
  return data;
}

exports.getProducts = async (req, res) => {
  try {
    const { category, tag, search, q, limit, featured } = req.query;
    const filter = { isActive: { $ne: false } };
    const terms = [];
    if (category) {
      const cat = category.toLowerCase();
      if (cat === 'raftar' || cat === 'superstar') {
        filter.brand = cat;
      } else {
        terms.push({
          $or: [
            { category: new RegExp(`^${category}$`, 'i') },
            { brand: cat }
          ]
        });
      }
    }
    if (tag) terms.push({ tags: tag });
    if (featured === 'true') terms.push({ featured: true });
    const keyword = search || q;
    if (keyword) {
      const re = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      terms.push({
        $or: [
          { name: re },
          { article: re },
          { category: re },
          { brand: re },
          { tags: re },
          { description: re },
          { colors: re }
        ]
      });
    }
    if (terms.length) filter.$and = terms;
    let query = Product.find(filter).sort({ createdAt: -1 });
    if (limit) query = query.limit(parseInt(limit));
    const products = await query.lean();
    res.json({ success: true, count: products.length, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getProduct = async (req, res) => {
  try {
    let product = null;
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(req.params.id).lean();
    }
    if (!product) product = await Product.findOne({ slug: req.params.id }).lean();
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const body = parseBody(req.body);
    if (req.uploadedUrls?.length) body.images = [...(body.images || []), ...req.uploadedUrls];
    else if (req.uploadedUrl) body.images = [...(body.images || []), req.uploadedUrl];
    const product = await Product.create(body);
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const body = parseBody(req.body);
    if (req.uploadedUrls?.length) body.images = [...(body.images || []), ...req.uploadedUrls];
    else if (req.uploadedUrl) body.images = [...(body.images || []), req.uploadedUrl];
    const product = await Product.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateStock = async (req, res) => {
  try {
    const stock = parseInt(req.body.stock);
    const product = await Product.findByIdAndUpdate(req.params.id, { stock }, { new: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
