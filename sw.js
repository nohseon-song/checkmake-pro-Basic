// 간단 캐시 (정적 리소스만)
const CACHE_NAME = 'cm-basic-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/app-icon-192-basic.png',
  './icons/app-icon-256-basic.png',
  './icons/app-icon-512-basic.png',
  './icons/apple-touch-icon-basic.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)).then(self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const { request } = e;

  // 오직 같은 오리진의 GET만 캐시
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  e.respondWith(
    caches.match(request).then(cached => {
      const net = fetch(request).then(res => {
        // 정적 파일만 캐시 갱신
        if (res.ok && ASSETS.some(p => request.url.endsWith(p.replace('./','')))) {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(request, resClone));
        }
        return res;
      }).catch(() => cached);
      return cached || net;
    })
  );
});
