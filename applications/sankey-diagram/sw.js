// Sankey Studio · Noorullah Adel. This cache belongs only to this app.
const CACHE_PREFIX = 'noorullah-sankey-diagram-';
const CACHE_REVISION = '959aed21e3cf135b';
const CACHE_NAME = CACHE_PREFIX + CACHE_REVISION;
const PRECACHE = [
  "./",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./assets/icon-maskable-512.png",
  "./assets/logo.svg",
  "./index.html",
  "./manifest.webmanifest",
  "./src/app.js",
  "./src/export.js",
  "./src/layout.js",
  "./src/model.js",
  "./src/pwa.js",
  "./src/render.js",
  "./src/samples.js",
  "./src/styles.css",
  "./src/vendor/LICENSE",
  "./src/vendor/align.js",
  "./src/vendor/array.js",
  "./src/vendor/constant.js",
  "./src/vendor/sankey.js"
];
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE.map((url) => new Request(url, { cache: 'reload' })))).catch(async (error) => {
    await caches.delete(CACHE_NAME);
    throw error;
  }));
});
self.addEventListener('message', (event) => { if (event.data?.type === 'ACTIVATE_UPDATE') self.skipWaiting(); });
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) if (key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME) await caches.delete(key);
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== location.origin || !url.href.startsWith(self.registration.scope)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(event.request, { ignoreSearch: true });
    if (cached) return cached;
    try { return await fetch(event.request); }
    catch {
      if (event.request.mode === 'navigate') return await cache.match('./index.html');
      return Response.error();
    }
  })());
});
