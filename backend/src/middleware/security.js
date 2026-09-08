const APP_KEY = (process.env.API_ACCESS_KEY || 'raftar-frontend-key-2026').trim();

const ALLOWED = (process.env.ALLOWED_ORIGINS ||
  'http://localhost:3000,http://localhost:5173,http://localhost:5000,https://raftarfootwear.com,https://www.raftarfootwear.com')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const buckets = new Map();
let lastPrune = Date.now();

function clientKey(req) {
  const ip = (req.ip || 'unknown')
    .replace(/^::ffff:/, '')
    .replace(/^::1$/, '127.0.0.1');
  return `${ip}|${req.method} ${req.originalUrl.split('?')[0]}`;
}

function pruneBuckets(now) {
  if (now - lastPrune < 60000) return;
  lastPrune = now;
  for (const [k, b] of buckets) {
    if (now > b.reset) buckets.delete(k);
  }
  if (buckets.size > 20000) {
    const before = buckets.size;
    for (const [k, b] of buckets) {
      if (now > b.reset) buckets.delete(k);
      if (buckets.size <= 15000) break;
      if (buckets.size === before && buckets.size > 15000) buckets.clear();
    }
  }
}

function rateLimit({ windowMs, max, message, methods = null }) {
  return (req, res, next) => {
    if (methods && !methods.includes(req.method)) return next();
    const now = Date.now();
    pruneBuckets(now);
    const key = clientKey(req);
    let b = buckets.get(key);
    if (!b || now > b.reset) {
      b = { hits: 0, reset: now + windowMs };
      buckets.set(key, b);
    }
    b.hits += 1;
    if (b.hits > max) {
      const retryAfter = Math.ceil((b.reset - now) / 1000);
      res.set('Retry-After', String(retryAfter));
      return res.status(429).json({
        success: false,
        message: message || 'Too many requests. Please try again later.',
      });
    }
    next();
  };
}

function originGuard(req, res, next) {
  let origin = req.headers.origin || '';
  if (!origin && req.headers.referer) {
    try {
      origin = new URL(req.headers.referer).origin;
    } catch {
      origin = '';
    }
  }
  if (!origin) return next();
  if (!ALLOWED.includes(origin)) {
    console.warn('[security] Blocked request from untrusted origin:', origin, '→', req.method, req.originalUrl);
    return res.status(403).json({
      success: false,
      message: 'Direct API access is blocked.',
    });
  }
  next();
}

function appKeyGuard(req, res, next) {
  const key = (req.headers['x-app-key'] || '').trim();
  if (!key || key !== APP_KEY) {
    return res.status(403).json({
      success: false,
      message: 'Direct API access is blocked. Unauthorized caller.',
    });
  }
  next();
}

module.exports = { rateLimit, originGuard, appKeyGuard };