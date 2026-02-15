// Custom service worker additions
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker');
  event.waitUntil(clients.claim());
});

// Ensure fetch events are handled (required for PWA installability)
self.addEventListener('fetch', (event) => {
  // Let next-pwa handle the actual caching strategy
  // This event listener ensures Chrome recognizes this as a valid SW
});
