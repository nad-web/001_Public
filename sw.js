/* Retire only the previous repository-wide library cache. */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) =>
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys())
        if (key.startsWith("noorullah-build-lab-001-"))
          await caches.delete(key);
      await self.clients.claim();
      await self.registration.unregister();
    })(),
  ),
);
