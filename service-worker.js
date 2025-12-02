/**
 * CAPD Service Worker
 * Manages cache clearing and ensures fresh site data on every visit
 * Specifically designed to clear cached data for passcode protection system
 */

const CACHE_VERSION = 'capd-v' + new Date().getTime();
const CACHE_PATTERNS = [
  'capd-v*',
  'capd-static-*',
  'capd-api-*'
];

// Install event - clear old caches immediately
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing new version...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Remove all old versioned caches
          if (cacheName.startsWith('capd-v')) {
            console.log('Service Worker: Clearing old cache -', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Installation complete. All old caches cleared.');
      // Skip waiting to activate new service worker immediately
      return self.skipWaiting();
    })
  );
});

// Activate event - clear caches and take control of clients
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating new version...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Clear all caches on activation
          if (cacheName.startsWith('capd-')) {
            console.log('Service Worker: Deleting cache -', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activated. Now claiming all clients.');
      // Claim all clients to apply the new service worker
      return self.clients.claim();
    })
  );
});

// Fetch event - don't cache anything, always fetch from network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // For all requests, fetch from network with no-cache
  event.respondWith(
    fetch(event.request.clone(), {
      // Force bypass of browser cache for network requests
      cache: 'no-store',
      // Add headers to prevent caching at origin level
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
    .then((response) => {
      // Don't cache anything
      return response;
    })
    .catch((error) => {
      console.warn('Service Worker: Fetch failed, returning offline response', error);
      // Return offline page if fetch fails
      return new Response('Offline - Unable to reach server', {
        status: 503,
        statusText: 'Service Unavailable',
        headers: new Headers({
          'Content-Type': 'text/plain'
        })
      });
    })
  );
});

// Message event - handle messages from clients
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received -', event.data);

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            console.log('Service Worker: Clearing cache -', cacheName);
            return caches.delete(cacheName);
          })
        );
      }).then(() => {
        console.log('Service Worker: All caches cleared on demand');
        // Notify client that cache is cleared
        event.ports[0].postMessage({ success: true, message: 'Cache cleared' });
      })
    );
  }

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('Service Worker: Script loaded and ready for registration');
