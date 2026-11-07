self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) =>
  event.waitUntil(
    (async () => {
      const prefix = "hainburg-fa:" + self.registration.scope + ":";
      for (const key of await caches.keys())
        if (key.startsWith(prefix)) await caches.delete(key);
      await self.clients.claim();
      await self.registration.unregister();
    })(),
  ),
);
