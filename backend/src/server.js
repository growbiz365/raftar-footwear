require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const connectDB = require('./config/db');
const { originGuard, rateLimit, appKeyGuard } = require('./middleware/security');

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins =
  (process.env.ALLOWED_ORIGINS ||
    'http://localhost:3000,http://localhost:5173,http://localhost:5000,https://raftarfootwear.com,https://www.raftarfootwear.com')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

app.use(
  cors({
    origin(origin, cb) {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(null, false);
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Public health check (no API key required – used by Hostinger / uptime checks)
app.get('/api/health', (req, res) => res.json({ status: 'ok', version: '3.0.0' }));

app.use('/api', originGuard);
app.use('/api', appKeyGuard);
app.use('/api', rateLimit({ windowMs: 60_000, max: 240, methods: ['POST'], message: 'Too many requests. Slow down your API access.' }));

app.post('/api/auth/login', rateLimit({ windowMs: 15 * 60_000, max: 20, message: 'Too many login attempts. Try again in 15 minutes.' }));

app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/settings', require('./routes/settingRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/blogs', require('./routes/blogRoutes'));

// Serve the pre-built React app (combined deployment on shared hosting)
const clientDist = path.join(__dirname, '..', '..', 'frontend', 'dist');
if (fs.existsSync(path.join(clientDist, 'index.html'))) {
  app.use(express.static(clientDist));

  // SPA catch-all – serve index.html for any non-API route
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// 404 for unknown API routes (and anything else in dev when dist isn't built)
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Revone API on http://localhost:${PORT}`);
    console.log(`📊 Admin: /api/admin | Settings: /api/settings`);
  });
});
