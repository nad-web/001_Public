/* App-scoped offline core and explicitly saved video. MIT · Noorullah Adel, 2026. */
const EMBEDDED_MANIFEST = null;
const SCOPE = self.registration.scope,
  PREFIX = "noorullah-app:" + new URL(SCOPE).pathname + ":";
let configurationPromise;
function configuration() {
  return (configurationPromise ??= EMBEDDED_MANIFEST
    ? Promise.resolve(EMBEDDED_MANIFEST)
    : fetch(new URL("offline-manifest.json", SCOPE)).then((r) => {
        if (!r.ok) throw new Error("Missing offline manifest");
        return r.json();
      }));
}
self.addEventListener("install", (event) =>
  event.waitUntil(
    (async () => {
      const config = await configuration(),
        name = PREFIX + config.revision,
        cache = await caches.open(name);
      try {
        await cache.addAll(config.files.map((f) => new URL(f, SCOPE).href));
      } catch (error) {
        await caches.delete(name);
        throw error;
      }
      if (!self.registration.active) await self.skipWaiting();
    })(),
  ),
);
self.addEventListener("activate", (event) =>
  event.waitUntil(
    (async () => {
      const config = await configuration();
      for (const key of await caches.keys())
        if (
          key.startsWith(PREFIX) &&
          key !== PREFIX + config.revision &&
          key !== PREFIX + "videos"
        )
          await caches.delete(key);
      await self.clients.claim();
    })(),
  ),
);
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
  if (event.data?.type === "CHECK_READY")
    event.waitUntil(
      (async () => {
        try {
          const config = await configuration(),
            cache = await caches.open(PREFIX + config.revision);
          const ready = (
            await Promise.all(
              config.files.map((f) => cache.match(new URL(f, SCOPE).href)),
            )
          ).every(Boolean);
          event.ports[0]?.postMessage({ ready });
        } catch {
          event.ports[0]?.postMessage({ ready: false });
        }
      })(),
    );
});
async function ranged(response, header) {
  const bytes = await response.arrayBuffer(),
    length = bytes.byteLength,
    match = /^bytes=(\d*)-(\d*)$/.exec(header || "");
  let start, end;
  if (match && (match[1] || match[2])) {
    if (!match[1]) {
      const suffix = Number(match[2]);
      if (Number.isSafeInteger(suffix) && suffix > 0) {
        start = Math.max(0, length - suffix);
        end = length - 1;
      }
    } else {
      start = Number(match[1]);
      end = match[2] ? Math.min(Number(match[2]), length - 1) : length - 1;
    }
  }
  if (
    !Number.isSafeInteger(start) ||
    !Number.isSafeInteger(end) ||
    start < 0 ||
    start >= length ||
    end < start
  )
    return new Response(null, {
      status: 416,
      headers: { "Content-Range": `bytes */${length}` },
    });
  const headers = new Headers(response.headers);
  headers.set("Content-Range", `bytes ${start}-${end}/${length}`);
  headers.set("Content-Length", String(end - start + 1));
  headers.set("Accept-Ranges", "bytes");
  headers.delete("Content-Encoding");
  return new Response(bytes.slice(start, end + 1), { status: 206, headers });
}
self.addEventListener("fetch", (event) => {
  const request = event.request,
    url = new URL(request.url);
  if (
    request.method !== "GET" ||
    url.origin !== new URL(SCOPE).origin ||
    !url.href.startsWith(SCOPE)
  )
    return;
  event.respondWith(
    (async () => {
      const config = await configuration(),
        cache = await caches.open(PREFIX + config.revision);
      if (url.pathname.endsWith(".mp4")) {
        const video = await (
          await caches.open(PREFIX + "videos")
        ).match(url.href);
        return video
          ? request.headers.has("Range")
            ? ranged(video, request.headers.get("Range"))
            : video
          : fetch(request);
      }
      if (request.mode === "navigate") {
        try {
          const response = await fetch(request);
          if (response.ok) return response;
        } catch {}
        const offline = await cache.match(new URL("index.html", SCOPE).href);
        if (offline) return offline;
        return new Response("Open this app online first.", { status: 503 });
      }
      const stored = await cache.match(request, { ignoreSearch: true });
      if (stored)
        return request.headers.has("Range")
          ? ranged(stored, request.headers.get("Range"))
          : stored;
      return fetch(request);
    })(),
  );
});
