
const CACHE_NAME = 'imperivm-v1';
const ASSETS = [
  './index.html',
  './metadata.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  // Estratégia: Network First para garantir que atualizações do Don Supremo apareçam na hora
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
