/* Ragdoll Drop service worker — same strategy as the sibling ScupperLab apps:
   network-first app shell (a plain deploy reaches installed iPads on their next
   online launch), cache-first for the heavy static stuff, relative paths so it
   works from a subfolder on github.io.

   Three.js is vendored into this repo rather than loaded from a CDN, so the
   game runs with no network at all once installed. Google Fonts are the one
   remaining cross-origin fetch; they are cached opportunistically on first
   online launch and fall back to the system stack before that. */
importScripts("version.js");                 // single source of truth for the version
const CACHE = "ragdoll-drop-v" + self.APP_VERSION;

const SCOPE = self.registration ? self.registration.scope : "./";
const ASSETS = [
  "",
  "index.html",
  "version.js",
  "manifest.webmanifest",
  "vendor/three.min.js",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-180.png",
  "icons/icon-maskable-512.png",
].map((p) => new URL(p, SCOPE).toString());

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      // only ever touch our own caches — siblings share this origin on github.io
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("ragdoll-drop-") && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function putInCache(req, res) {
  if (res && res.ok) {
    const copy = res.clone();
    caches.open(CACHE).then((c) => c.put(req, copy));
  }
  return res;
}

const FONT_HOSTS = ["fonts.googleapis.com", "fonts.gstatic.com"];

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  if (url.origin !== self.location.origin) {
    // the fonts are the only third party left: serve them from cache once seen,
    // and never let a failed font fetch break a launch
    if (FONT_HOSTS.indexOf(url.hostname) >= 0) {
      event.respondWith(
        caches.match(req).then((cached) =>
          cached ||
          fetch(req).then((res) => putInCache(req, res)).catch(() => new Response("", { status: 504 }))
        )
      );
    }
    return;
  }
  if (!url.pathname.startsWith(new URL(SCOPE).pathname)) return;

  const isShell =
    req.mode === "navigate" ||
    url.pathname.endsWith("/") ||
    /(?:^|\/)(index\.html|version\.js|manifest\.webmanifest)$/.test(url.pathname);

  if (isShell) {
    // no-cache = always revalidate with GitHub Pages (its max-age is 10 min),
    // so a deploy reaches the iPad on the very next online launch
    event.respondWith(
      fetch(req, { cache: "no-cache" })
        .then((res) => putInCache(req, res))
        .catch(() =>
          caches.match(req).then((cached) => {
            if (cached) return cached;
            if (req.mode === "navigate") return caches.match(new URL("index.html", SCOPE).toString());
            return new Response("", { status: 504, statusText: "offline" });
          })
        )
    );
  } else {
    event.respondWith(
      caches.match(req).then((cached) =>
        cached ||
        fetch(req).then((res) => putInCache(req, res)).catch(() => new Response("", { status: 504 }))
      )
    );
  }
});
