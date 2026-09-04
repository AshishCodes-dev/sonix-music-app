import { applyCors, rateLimit } from './_security.js';

// Server-only secret — set this in Vercel Project Settings → Environment Variables.
// Do NOT prefix with VITE_ / NEXT_PUBLIC_, or it will be exposed to the browser.
const YT_KEY = process.env.YOUTUBE_API_KEY;

const YT_BASE = 'https://www.googleapis.com/youtube/v3';

export default async function handler(req, res) {
  applyCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (rateLimit(req, res, { max: 60, windowMs: 60000 })) return;

  if (!YT_KEY) {
    return res.status(500).json({
      error: { message: 'YOUTUBE_API_KEY is not configured on the server.', reason: 'missingServerKey' },
    });
  }

  try {
    const { action, q, maxResults, regionCode } = req.query;

    // --- key validation ping (used by Settings page "Test key" flow) ---
    if (action === 'validate') {
      const url = `${YT_BASE}/search?part=snippet&type=video&maxResults=1&q=test&key=${encodeURIComponent(YT_KEY)}`;
      const r = await fetch(url);
      const body = await r.json().catch(() => ({}));
      if (!r.ok) {
        const err = body?.error;
        const reason = err?.errors?.[0]?.reason || '';
        return res.status(r.status).json({ error: { reason, message: err?.message || `HTTP ${r.status}` } });
      }
      return res.status(200).json({ valid: true });
    }

    // --- trending / most popular (1 quota unit) ---
    if (action === 'trending') {
      const max = Math.min(Number(maxResults) || 20, 50);
      const region = regionCode || 'IN';
      const url = `${YT_BASE}/videos?part=snippet&chart=mostPopular&videoCategoryId=10&maxResults=${max}&regionCode=${encodeURIComponent(region)}&key=${encodeURIComponent(YT_KEY)}`;
      const r = await fetch(url);
      const body = await r.json().catch(() => ({}));
      if (!r.ok) {
        const err = body?.error;
        const reason = err?.errors?.[0]?.reason || '';
        return res.status(r.status).json({ error: { errors: [{ reason }], message: err?.message || `HTTP ${r.status}` } });
      }
      return res.status(200).json(body);
    }

    // --- default: search ---
    if (!q) {
      return res.status(400).json({ error: { message: 'Missing q parameter.' } });
    }
    const max = Math.min(Number(maxResults) || 15, 50);
    const url = `${YT_BASE}/search?part=snippet&type=video&videoCategoryId=10&maxResults=${max}&q=${encodeURIComponent(q)}&key=${encodeURIComponent(YT_KEY)}`;
    const r = await fetch(url);
    const body = await r.json().catch(() => ({}));
    if (!r.ok) {
      const err = body?.error;
      const reason = err?.errors?.[0]?.reason || '';
      const status = reason === 'quotaExceeded' || reason === 'dailyLimitExceeded' ? 429 : r.status;
      return res.status(status).json({ error: { errors: [{ reason }], message: err?.message || `HTTP ${r.status}` } });
    }
    return res.status(200).json(body);
  } catch (e) {
    console.error('[api/youtube-search] error:', e);
    return res.status(500).json({ error: { message: e?.message || 'Internal error' } });
  }
}
