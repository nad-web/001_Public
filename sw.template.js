const CACHE_KEY = '__CACHE_KEY__';
const PREFIX = 'noorullah-build-lab-001-';
const PRECACHE = __PRECACHE__;
self.addEventListener('install', (event) =>
  event.waitUntil(
    caches
      .open(CACHE_KEY)
      .then((cache) =>
        cache.addAll(
          PRECACHE.map((url) => new Request(url, { cache: 'reload' })),
        ),
      ),
  ),
);
self.addEventListener('message', (event) => {
  if (event.data?.type === 'ACTIVATE_UPDATE') self.skipWaiting();
});
self.addEventListener('activate', (event) =>
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys())
        if (key.startsWith(PREFIX) && key !== CACHE_KEY)
          await caches.delete(key);
      await self.clients.claim();
    })(),
  ),
);
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (
    url.origin !== location.origin ||
    !url.href.startsWith(self.registration.scope)
  )
    return;
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_KEY);
      const cached =
        (await cache.match(event.request)) ||
        (await cache.match(
          new URL(
            url.pathname.endsWith('/')
              ? url.pathname + 'index.html'
              : url.pathname,
            location.origin,
          ).href,
        ));
      // Serve one coherent cached release until the user accepts an update.
      if (cached) return cached;
      try {
        return await fetch(event.request);
      } catch {
        return new Response(
          'This page is not available offline yet. Reconnect and open the library once.',
          {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
          },
        );
      }
    })(),
  );
});
