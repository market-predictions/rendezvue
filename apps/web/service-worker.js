const CACHE_NAME = 'rendezvue-shell-v2-nl';
const SHELL = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/src/domain.js',
  '/src/i18n.js',
  '/src/camera.js',
  '/src/avatar.js',
  '/src/demo-data.js',
  '/manifest.webmanifest',
  '/assets/icons/icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(fetch(event.request).then((response) => {
    if (response.ok && !url.pathname.includes('/api/')) {
      const copy = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
    }
    return response;
  }).catch(() => caches.match(event.request).then((cached) => cached || caches.match('/index.html'))));
});
