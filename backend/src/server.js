require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/settings', require('./routes/settingRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/blogs', require('./routes/blogRoutes'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', version: '3.0.0' }));

app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Revone API on http://localhost:${PORT}`);
    console.log(`📊 Admin: /api/admin | Settings: /api/settings`);
  });
});
