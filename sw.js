const CACHE_NAME = 'timeglass-v1';
const RUNTIME_CACHE = 'timeglass-runtime-v1';

// Assets to precache (base set)
const PRECACHE_ASSETS = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Install event - precache base assets and dynamically fetch points.json for photo URLs
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      // Precache base assets
      await cache.addAll(PRECACHE_ASSETS);

      // Fetch points.json to get photo URLs for dynamic precaching
      try {
        const pointsResponse = await fetch('./points.json');
        if (pointsResponse.ok) {
          const pointsData = await pointsResponse.json();
          const photoUrls = pointsData.points.map(p => p.photoUrl).filter(url => url);

          // Precache all photo URLs
          const photoCachePromises = photoUrls.map(url => {
            return cache.add(url).catch(err => {
              console.warn('Failed to cache photo:', url, err);
            });
          });

          await Promise.all(photoCachePromises);
          console.log('Precached', photoUrls.length, 'photos from points.json');
        }
      } catch (err) {
        console.warn('Failed to fetch points.json for precaching:', err);
      }

      // Skip waiting to activate immediately
      self.skipWaiting();
    })()
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Clean up old caches
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map(name => caches.delete(name))
      );

      // Take control of all clients immediately
      self.clients.claim();
    })()
  );
});

// Fetch event - cache-first for same-origin, runtime cache for CDN
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Cache-first for same-origin requests (index.html, points.json, photos)
  if (url.origin === self.location.origin) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(event.request);

        if (cachedResponse) {
          return cachedResponse;
        }

        try {
          const networkResponse = await fetch(event.request);
          // Cache the response for future use
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        } catch (err) {
          console.warn('Fetch failed for same-origin request:', event.request.url, err);
          throw err;
        }
      })()
    );
  }
  // Runtime cache for CDN requests (CLIP model files from jsdelivr)
  else if (url.hostname === 'cdn.jsdelivr.net') {
    event.respondWith(
      (async () => {
        const cache = await caches.open(RUNTIME_CACHE);
        const cachedResponse = await cache.match(event.request);

        if (cachedResponse) {
          return cachedResponse;
        }

        try {
          const networkResponse = await fetch(event.request);
          // Cache the response for future use
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        } catch (err) {
          console.warn('Fetch failed for CDN request:', event.request.url, err);
          throw err;
        }
      })()
    );
  }
  // For other requests, just pass through
  else {
    event.respondWith(fetch(event.request));
  }
});
