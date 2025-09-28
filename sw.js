// sw.js — Network-first for index.html (홈런처 멈춤 방지), cache-fallback for 정적자산
const CACHE_NAME = "cm-basic-v1";
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icons/app-icon-192-basic.png",
  "./icons/app-icon-256-basic.png",
  "./icons/app-icon-512-basic.png",
  "./icons/apple-touch-icon-basic.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(CORE_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => (k === CACHE_NAME ? null : caches.delete(k))))
    )
  );
  self.clients.claim();
});

// index.html만은 network-first(오래된 캐시로 멈춤 방지)
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (url.pathname.endsWith("/") || url.pathname.endsWith("/index.html")) {
    e.respondWith(
      fetch(e.request).then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        return res;
      }).catch(() => caches.match(e.request))
    );
    return;
  }
  // 나머지 정적 파일은 cache-first
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request))
  );
});
