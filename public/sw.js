const CACHE_NAME = 'toothly-v4';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Install event - cache essential files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network (skip Vite dev assets and non-GET)
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const isDevAsset = url.pathname.startsWith('/@vite') || url.pathname.includes('/node_modules/.vite/') || url.pathname.startsWith('/src/');
  const isMapOrHMR = url.pathname.endsWith('.map') || url.searchParams.has('import');

  if (isDevAsset || isMapOrHMR) {
    // Let the network handle these to avoid caching dev/HMR assets
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;

      return fetch(req).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(req, responseToCache);
        });
        return response;
      }).catch(() => cached);
    })
  );
});
