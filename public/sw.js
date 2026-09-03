// SONIQ service worker — network-first so users ALWAYS get the latest version.
const CACHE = 'soniq-v3';

self.addEventListener('install', () => {
  self.skipWaiting(); // activate the new SW immediately
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Never touch API / YouTube / Supabase — always network.
  if (
    url.origin !== self.location.origin ||
    url.pathname.startsWith('/api/') ||
    url.hostname.includes('googleapis') ||
    url.hostname.includes('supabase') ||
    url.hostname.includes('youtube')
  ) {
    return;
  }

  // HTML / navigation: network-first (always latest), cache only as offline fallback.
  if (req.mode === 'navigate' || url.pathname === '/' || url.pathname.endsWith('.html')) {
    e.respondWith(
      fetch(req).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Hashed static assets (js/css/img): cache-first is safe (filenames change each build).
  e.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(req, clone));
        }
        return res;
      });
    })
  );
});
