// sw.js — CheckMake PRO-Basic PWA Service Worker
// STEP-1: 캐시 버전만 바꾸면 즉시 새 아이콘/리소스가 반영됨.
const CACHE_NAME = 'cmp-basic-v1.0.0';

// STEP-2: 초기 프리캐시 리소스(필수 최소셋)
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/app-icon-192-basic.png',
  './icons/app-icon-256-basic.png',
  './icons/app-icon-512-basic.png',
  './icons/apple-touch-icon-basic.png'
];

// 설치
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// 활성화(이전 캐시 정리)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k === CACHE_NAME ? null : caches.delete(k))))
    )
  );
  self.clients.claim();
});

// 네트워크 우선 + 캐시 폴백(아이콘/매니페스트는 캐시 허용)
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  event.respondWith(
    fetch(request)
      .then((res) => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, resClone));
        return res;
      })
      .catch(async () => {
        const hit = await caches.match(request);
        return hit || new Response('Offline', { status: 503, statusText: 'Offline' });
      })
  );
});
