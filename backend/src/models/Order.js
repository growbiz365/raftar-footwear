const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [{
    productId: String,
    name: String,
    qty: Number,
    price: Number,
    image: String,
    color: String,
    size: String,
    packSize: Number
  }],
  total: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'],
    default: 'pending'
  },
  customer: {
    name: String,
    email: String,
    phone: String,
    address: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
