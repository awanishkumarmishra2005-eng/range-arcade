// Counts one page visit. Stores only daily totals: no IP addresses, no cookies, no names.
const BASE = process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

function today() {
  return new Date().toISOString().slice(0, 10);
}

async function incr(key) {
  const r = await fetch(`${BASE}/incr/${key}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  if (!r.ok) throw new Error('incr failed');
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ ok: false });
  if (!BASE || !TOKEN) return res.status(500).json({ ok: false, error: 'Storage not configured' });
  try {
    await Promise.all([incr('visits:total'), incr('visits:' + today())]);
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ ok: false });
  }
};
