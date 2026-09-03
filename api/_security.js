// Shared security helpers for API routes: safe CORS + basic in-memory rate limiting.

const ALLOWED = [
  'https://luxe-fashion-fx6s.arcada.app',
  'https://soniq-music.arcada.app',
];

// Apply CORS headers. Reflects the request origin only if it's allowed (or an
// arcada.app / vercel.app preview). Falls back to same-origin.
export function applyCors(req, res) {
  const origin = req.headers.origin || '';
  const ok =
    ALLOWED.includes(origin) ||
    /\.arcada\.app$/.test(origin) ||
    /\.vercel\.app$/.test(origin) ||
    /localhost(:\d+)?$/.test(origin);
  res.setHeader('Access-Control-Allow-Origin', ok ? origin : ALLOWED[0]);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('X-Content-Type-Options', 'nosniff');
}

// Very small in-memory rate limiter (per serverless instance). Good enough to
// blunt basic abuse/scraping without any external dependency.
const buckets = new Map();
export function rateLimit(req, res, { max = 60, windowMs = 60000 } = {}) {
  const ip =
    (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    'unknown';
  const now = Date.now();
  const b = buckets.get(ip);
  if (!b || now > b.reset) {
    buckets.set(ip, { count: 1, reset: now + windowMs });
    return false;
  }
  b.count++;
  if (b.count > max) {
    res.setHeader('Retry-After', Math.ceil((b.reset - now) / 1000));
    res.status(429).json({ error: 'Too many requests. Please slow down.' });
    return true;
  }
  return false;
}

// occasionally clean old buckets to avoid unbounded memory
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of buckets) if (now > v.reset) buckets.delete(k);
}, 300000).unref?.();
