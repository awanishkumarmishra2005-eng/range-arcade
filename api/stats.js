// Returns totals for the admin page. Requires the ADMIN_KEY environment variable.
const crypto = require('crypto');
const BASE = process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const ADMIN = process.env.ADMIN_KEY || '';

function dayKey(offset) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - offset);
  return d.toISOString().slice(0, 10);
}

// Constant-time comparison so the key cannot be guessed by timing.
function safeEqual(a, b) {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

module.exports = async (req, res) => {
  if (!ADMIN || !safeEqual(req.headers['x-admin-key'] || '', ADMIN)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (!BASE || !TOKEN) return res.status(500).json({ error: 'Storage not configured' });

  const days = Array.from({ length: 14 }, (_, i) => dayKey(13 - i));
  const keys = ['visits:total', ...days.map(d => 'visits:' + d)];
  try {
    const r = await fetch(`${BASE}/mget/${keys.join('/')}`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    });
    const body = await r.json();
    const vals = (body.result || []).map(v => Number(v) || 0);
    return res.status(200).json({
      total: vals[0] || 0,
      days: days.map((date, i) => ({ date, visits: vals[i + 1] || 0 })),
    });
  } catch (e) {
    return res.status(500).json({ error: 'Storage unavailable' });
  }
};
