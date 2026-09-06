/* pip service worker: installable shell + push. Never caches /api/*. Versioned by ?v=BUILD_ID. */
const VERSION = new URL(self.location).searchParams.get("v") || "dev";
const SHELL = `pip-shell-${VERSION}`;
const STATIC = `pip-static-${VERSION}`;
// Public shell only — never precache auth-gated routes like /pause (they redirect
// for a logged-out install and would fail the cache). Each entry is added
// independently so one failure can't abort the whole install (non-atomic).
const PRECACHE = ["/offline", "/help", "/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL)
      .then((cache) => Promise.all(PRECACHE.map((url) => cache.add(url).catch(() => {}))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== SHELL && k !== STATIC).map((k) => caches.delete(k))),
    ).then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  // Never touch API or auth-sensitive routes.
  if (url.pathname.startsWith("/api/")) return;

  // Static assets: cache-first.
  if (url.pathname.startsWith("/_next/static") || url.pathname.startsWith("/icons/") || url.pathname.startsWith("/fonts/") || url.pathname === "/manifest.webmanifest") {
    event.respondWith(
      caches.open(STATIC).then(async (cache) => {
        const hit = await cache.match(req);
        if (hit) return hit;
        const res = await fetch(req);
        if (res.ok) cache.put(req, res.clone());
        return res;
      }),
    );
    return;
  }

  // Navigations: go to the network normally (so redirects update the URL); only
  // fall back to the cached offline shell when the network is truly unreachable.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(async () => {
        const cache = await caches.open(SHELL);
        return (await cache.match("/offline")) || Response.error();
      }),
    );
  }
});

self.addEventListener("push", (event) => {
  let data = { title: "pip", body: "", url: "/thread", tag: "pip" };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {}
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      tag: data.tag,
      renotify: false,
      data: { url: data.url },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/thread";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const c of clients) {
        if ("focus" in c) {
          c.navigate(url);
          return c.focus();
        }
      }
      return self.clients.openWindow(url);
    }),
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});
