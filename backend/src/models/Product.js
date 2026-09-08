const mongoose = require('mongoose');

const colorVariantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  hex: { type: String, default: '#000000' },
  image: { type: String, default: '' }
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, lowercase: true },
  price: { type: Number, required: true },
  packPrices: {
    1: { type: Number },
    6: { type: Number },
    12: { type: Number }
  },
  compareAtPrice: { type: Number, default: null },
  images: [{ type: String }],
  colors: [{ type: String }],
  colorVariants: [colorVariantSchema],
  sizes: [{ type: String }],
  brand: { type: String, enum: ['raftar', 'superstar', 'other'], default: 'raftar' },
  category: { type: String, required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  tags: [{ type: String }],
  description: { type: String, default: '' },
  article: { type: String, default: '' },
  stock: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  countdown: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  isWholesale: { type: Boolean, default: true }
}, { timestamps: true });

productSchema.pre('save', function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }
  if (!this.packPrices || !this.packPrices[1]) {
    this.packPrices = {
      1: this.price,
      6: Math.round(this.price * 6 * 0.95),
      12: Math.round(this.price * 12 * 0.90)
    };
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
