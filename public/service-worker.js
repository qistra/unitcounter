// Service Worker for WattShare PWA

const CACHE_NAME = 'wattshare-cache-v2';
const STATIC_CACHE_NAME = 'wattshare-static-v2';
const DYNAMIC_CACHE_NAME = 'wattshare-dynamic-v2';

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/placeholder.svg',
  '/pwa-icons/icon-192x192.png',
  '/pwa-icons/icon-512x512.png'
];

// Assets to cache when they're first used
const DYNAMIC_ASSETS_PATTERNS = [
  /\.(js|css|woff2?)$/,  // JavaScript, CSS, and font files
  /^https:\/\/cdn\.gpteng\.co/  // External CDN resources
];

// Install service worker and cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE_NAME).then(cache => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      // Activate immediately without waiting for tabs to close
      self.skipWaiting()
    ])
  );
});

// Cache and return requests with different strategies
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // Return cached response if found
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then(response => {
        // Don't cache if not a valid response
        if (!response || response.status !== 200) {
          return response;
        }

        // Check if this is an asset we should cache
        const shouldCache = DYNAMIC_ASSETS_PATTERNS.some(pattern => 
          pattern.test(event.request.url)
        );

        if (shouldCache) {
          const responseToCache = response.clone();
          caches.open(DYNAMIC_CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }

        return response;
      }).catch(() => {
        // If fetch fails (offline), try to return a cached response
        return caches.match(event.request);
      });
    })
  );
});

// Clean up old caches and notify clients about updates
self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (![STATIC_CACHE_NAME, DYNAMIC_CACHE_NAME].includes(cacheName)) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Notify all clients about the update
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'SW_UPDATED',
            message: 'New version available! Refresh to update.'
          });
        });
      })
    ])
  );
});

// Listen for messages from the client
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
