const CACHE_NAME = 'sommething-v6';
const urlsToCache = ['/', '/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)));
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  // Skip caching for non-http(s) requests (chrome-extension, etc.)
  if (!event.request.url.startsWith('http')) {
    return;
  }

  const isSupabaseRequest = event.request.url.includes('.supabase.co');
  if (isSupabaseRequest) {
    event.respondWith(fetch(event.request));
    return;
  }

  // The Cache API only supports GET as a key — pass everything else (e.g. our
  // POST /api/extract-label calls) straight through without touching the cache.
  if (event.request.method !== 'GET') {
    event.respondWith(fetch(event.request));
    return;
  }

  // HTML navigations go network-first so a reload always tries to pick up the latest
  // deploy, falling back to cache only when offline. Cache-first (below) is reserved for
  // static assets, where staleness would otherwise survive a reload indefinitely.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache).catch((error) => {
              console.debug('Cache put failed:', error);
            });
          });
          return response;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match('/')))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request)
        .then((response) => {
          // Don't cache if:
          // - No response
          // - Not a success status (200-299)
          // - Not a basic/cors response
          // - Response from different origin
          if (
            !response ||
            !response.ok ||
            (response.type !== 'basic' && response.type !== 'cors')
          ) {
            return response;
          }

          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache).catch((error) => {
              // Silently fail cache puts to avoid console errors
              console.debug('Cache put failed:', error);
            });
          });
          return response;
        })
        .catch((error) => {
          // Network fetch failed, return cached response if available
          console.debug('Fetch failed:', error);
          return caches.match(event.request);
        });
    })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheWhitelist.indexOf(cacheName) === -1) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});
