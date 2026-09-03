// YouTube Data API v3 (search) + IFrame Player API (playback) helpers.
// Data API requests use the server-side proxy; playback still uses the IFrame API.

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: (() => void) | undefined;
  }
}

const CACHE_STORAGE = 'soniq_yt_cache';

export const YT_KEY_EVENT = 'soniq-yt-key-changed';

export function getApiKey(): string {
  return '';
}

export function setApiKey(key: string): boolean {
  void key;
  try { window.dispatchEvent(new CustomEvent(YT_KEY_EVENT)); } catch {}
  return false;
}

export function hasApiKey(): boolean {
  return true;
}

export function clearApiKey() {
  try { window.dispatchEvent(new CustomEvent(YT_KEY_EVENT)); } catch {}
}

/**
 * Validate an API key by making a real, minimal YouTube Data API request.
 * Returns { valid, error } where error is the EXACT Google reason/message.
 */
export async function validateApiKey(key: string): Promise<{ valid: boolean; error?: string }> {
  const k = (key || '').trim();
  if (!k) return { valid: false, error: 'Please paste an API key first.' };
  if (!/^AIza[0-9A-Za-z_-]{20,}$/.test(k)) {
    return { valid: false, error: 'That does not look like a valid Google API key (should start with "AIza").' };
  }
  try {
    void k;
    const res = await fetch('/api/youtube-search?action=validate');
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      return { valid: true };
    }
    const err = data?.error;
    const reason = err?.reason || '';
    const message = err?.message || err || `HTTP ${res.status}`;
    let friendly = message;
    if (reason === 'keyInvalid' || reason === 'badRequest' || /not valid/i.test(message)) friendly = 'This API key is invalid. Double-check you copied it correctly (no spaces).';
    else if (reason === 'quotaExceeded' || reason === 'dailyLimitExceeded') friendly = 'This key hit its daily quota. It will reset tomorrow (or raise the quota in Google Cloud).';
    else if (reason === 'accessNotConfigured' || /not been used|disabled/i.test(message)) friendly = 'YouTube Data API v3 is not enabled for this key. Enable it in Google Cloud Console → APIs & Services.';
    else if (reason === 'ipRefererBlocked' || /referer|referrer|blocked/i.test(message)) friendly = 'This key has application restrictions (HTTP referrer/IP) that block this site. In Google Cloud set “Application restrictions” to None (or add this site).';
    return { valid: false, error: `${friendly}${reason ? `  [${reason}]` : ''}` };
  } catch (e: any) {
    console.error('[YT] Validation network error:', e);
    return { valid: false, error: `Network error while validating: ${e?.message || e}` };
  }
}

// ---- Lyrics (free, no key needed via lyrics.ovh) ----
const LYRICS_CACHE = 'soniq_lyrics_cache';
function splitArtistTitle(title: string, artist: string): { artist: string; title: string } {
  // Titles like "Artist - Song (Official Video)" — try to extract cleanly
  let t = title
    .replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#39;/g, "'")
    .replace(/\((Official.*?|Lyric.*?|Audio|Video|4K|HD|Full Song|Visualizer|Slowed.*?|Reverb).*?\)/gi, '')
    .replace(/\[(Official.*?|Lyric.*?|Audio|Video|4K|HD).*?\]/gi, '')
    .replace(/\s*\|.*/, '')
    .trim();
  let a = (artist || '').replace(/\s*-?\s*Topic$/i, '').replace(/VEVO$/i, '').trim();
  // If title contains "Artist - Song"
  const dash = t.split(/\s[-–]\s/);
  if (dash.length >= 2) {
    if (!a || a.length > 40) a = dash[0].trim();
    t = dash.slice(1).join(' - ').trim();
  }
  // Remove feat.
  t = t.replace(/\(?feat\.?.*$/i, '').replace(/\(?ft\.?.*$/i, '').trim();
  return { artist: a, title: t };
}

export async function fetchLyrics(rawTitle: string, rawArtist: string): Promise<string | null> {
  const { artist, title } = splitArtistTitle(rawTitle, rawArtist);
  if (!title) return null;
  const cacheKey = `${artist}::${title}`.toLowerCase();
  try {
    const cache = JSON.parse(localStorage.getItem(LYRICS_CACHE) || '{}');
    if (cache[cacheKey] !== undefined) return cache[cacheKey];
  } catch {}

  const attempts = [
    [artist, title],
    ['', title],
  ];
  for (const [a, t] of attempts) {
    try {
      const url = `https://api.lyrics.ovh/v1/${encodeURIComponent(a || title)}/${encodeURIComponent(t)}`;
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();
      if (data?.lyrics && data.lyrics.trim()) {
        const clean = data.lyrics.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
        try {
          const cache = JSON.parse(localStorage.getItem(LYRICS_CACHE) || '{}');
          cache[cacheKey] = clean;
          localStorage.setItem(LYRICS_CACHE, JSON.stringify(cache));
        } catch {}
        return clean;
      }
    } catch {}
  }
  try {
    const cache = JSON.parse(localStorage.getItem(LYRICS_CACHE) || '{}');
    cache[cacheKey] = null;
    localStorage.setItem(LYRICS_CACHE, JSON.stringify(cache));
  } catch {}
  return null;
}

// ---- simple search cache to save quota ----
function readCache(): Record<string, string[]> {
  try {
    return JSON.parse(localStorage.getItem(CACHE_STORAGE) || '{}');
  } catch {
    return {};
  }
}
function writeCache(c: Record<string, string[]>) {
  try {
    localStorage.setItem(CACHE_STORAGE, JSON.stringify(c));
  } catch {}
}

export interface YTResult {
  videoId: string;
  title: string;
  channel: string;
  thumb: string;
  publishedAt?: string;
}

// Convert a YouTube result into the app's Song shape so the player + rows work unchanged.
export function ytToSong(r: YTResult): any {
  // Clean up common YouTube title noise
  const clean = r.title
    .replace(/\((Official.*?|Lyric.*?|Audio|Video|4K|HD|Full Song|Visualizer).*?\)/gi, '')
    .replace(/\[(Official.*?|Lyric.*?|Audio|Video|4K|HD).*?\]/gi, '')
    .replace(/\s*[|•].*/, '')
    .trim();
  return {
    id: `yt_${r.videoId}`,
    youtube_id: r.videoId,
    title: clean || r.title,
    artist_name: r.channel.replace(/\s*-?\s*Topic$/i, '').replace(/VEVO$/i, ''),
    artist_id: 0,
    album_id: 0,
    album_name: '',
    cover: r.thumb,
    audio_url: '',
    duration: 0,
    genre: 'YouTube',
    mood: '',
    plays: 0,
    lyrics: '',
    publishedAt: r.publishedAt,
  };
}

// Search YouTube and return ready-to-play Song objects.
export async function searchYouTubeSongs(query: string, max = 15): Promise<any[]> {
  const results = await searchYouTube(query, max);
  return results.map(ytToSong);
}

/**
 * Fetch trending/popular music videos. This uses the `videos.mostPopular`
 * endpoint which costs only **1 quota unit** (vs 100 for search), so the Home
 * page keeps working all day long even after the search quota is exhausted.
 * Cached per region+category for 6 hours.
 */
export async function getTrendingMusic(regionCode = 'IN', max = 20): Promise<YTResult[]> {
  const cacheKey = `trend_${regionCode}_${max}`;
  const cache = readResultCache();
  const tsRaw = (() => { try { return JSON.parse(localStorage.getItem('soniq_trend_ts') || '{}'); } catch { return {}; } })();
  const fresh = tsRaw[cacheKey] && (Date.now() - tsRaw[cacheKey] < 6 * 3600 * 1000);
  if (cache[cacheKey] && cache[cacheKey].length && fresh) {
    console.log('[YT] trending cache hit:', cacheKey);
    return cache[cacheKey];
  }
  const res = await fetch(`/api/youtube-search?action=trending&maxResults=${max}&regionCode=${encodeURIComponent(regionCode)}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const reason = body?.error?.errors?.[0]?.reason || String(res.status);
    const message = body?.error?.message || `HTTP ${res.status}`;
    if (cache[cacheKey]?.length) return cache[cacheKey];
    throw new Error(`YT_TREND_FAILED:${reason}:${message}`);
  }
  const data = await res.json();
  const results: YTResult[] = (data.items || [])
    .filter((it: any) => it.id)
    .map((it: any) => ({
      videoId: typeof it.id === 'string' ? it.id : it.id.videoId,
      title: it.snippet?.title || '',
      channel: it.snippet?.channelTitle || '',
      thumb: it.snippet?.thumbnails?.high?.url || it.snippet?.thumbnails?.medium?.url || '',
      publishedAt: it.snippet?.publishedAt || '',
    }));
  if (results.length) {
    cache[cacheKey] = results; writeResultCache(cache);
    tsRaw[cacheKey] = Date.now();
    try { localStorage.setItem('soniq_trend_ts', JSON.stringify(tsRaw)); } catch {}
  }
  return results;
}

export async function getTrendingSongs(regionCode = 'IN', max = 20): Promise<any[]> {
  const r = await getTrendingMusic(regionCode, max);
  return r.map(ytToSong);
}

/**
 * Search YouTube for music videos. Returns embeddable video candidates,
 * best match first. Throws if no API key or the request fails.
 */
// Full-result cache (title, thumb, channel) keyed by query — saves API quota.
const RESULT_CACHE = 'soniq_yt_results';
function readResultCache(): Record<string, YTResult[]> {
  try { return JSON.parse(localStorage.getItem(RESULT_CACHE) || '{}'); } catch { return {}; }
}
function writeResultCache(c: Record<string, YTResult[]>) {
  try {
    // keep the cache from growing unbounded
    const keys = Object.keys(c);
    if (keys.length > 120) keys.slice(0, keys.length - 120).forEach((k) => delete c[k]);
    localStorage.setItem(RESULT_CACHE, JSON.stringify(c));
  } catch {}
}

export async function searchYouTube(query: string, max = 6): Promise<YTResult[]> {
  // 1) Serve from cache first — this makes repeat browsing free (no quota used).
  const cacheKey = `${query}::${max}`;
  const cache = readResultCache();
  if (cache[cacheKey] && cache[cacheKey].length) {
    console.log('[YT] cache hit:', query);
    return cache[cacheKey];
  }

  const res = await fetch(`/api/youtube-search?q=${encodeURIComponent(query)}&maxResults=${max}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const reason = body?.error?.errors?.[0]?.reason || String(res.status);
    const message = body?.error?.message || `HTTP ${res.status}`;
    // Quota exhausted? Fall back to ANY cached result for a graceful experience.
    if (res.status === 429 || /quota|rateLimit/i.test(reason)) {
      const anyCached = cache[cacheKey] || Object.values(cache)[0];
      if (anyCached && anyCached.length) { console.warn('[YT] quota hit — serving cache'); return anyCached; }
      throw new Error('YT_SEARCH_FAILED:quotaExceeded:Daily YouTube search limit reached. It resets automatically after midnight (Pacific Time). Add a new API key in Settings to continue now.');
    }
    throw new Error(`YT_SEARCH_FAILED:${reason}:${message}`);
  }
  const data = await res.json();
  const results: YTResult[] = (data.items || [])
    .filter((it: any) => it.id?.videoId)
    .map((it: any) => ({
      videoId: it.id.videoId,
      title: it.snippet?.title || '',
      channel: it.snippet?.channelTitle || '',
      thumb: it.snippet?.thumbnails?.high?.url || it.snippet?.thumbnails?.medium?.url || '',
      publishedAt: it.snippet?.publishedAt || '',
    }));
  if (results.length) { cache[cacheKey] = results; writeResultCache(cache); }
  return results;
}

/** Return just the list of candidate video IDs for a query, with caching. */
export async function getVideoCandidates(query: string): Promise<string[]> {
  const cache = readCache();
  if (cache[query] && cache[query].length) return cache[query];
  const results = await searchYouTube(query, 8);
  const ids = results.map((r) => r.videoId);
  if (ids.length) {
    cache[query] = ids;
    writeCache(cache);
  }
  return ids;
}

// ---- IFrame Player API loader ----
let ytApiPromise: Promise<any> | null = null;
export function loadYouTubeApi(): Promise<any> {
  if (typeof window !== 'undefined' && window.YT && window.YT.Player) {
    return Promise.resolve(window.YT);
  }
  if (ytApiPromise) return ytApiPromise;
  ytApiPromise = new Promise((resolve) => {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (prev) prev();
      resolve(window.YT);
    };
  });
  return ytApiPromise;
}
