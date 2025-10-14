// Minimal SW: by default acts as a cache clearer to avoid stale content issues.
// Enable real caching only when VITE_ENABLE_SW=true and you ship an updated SW.
const CACHE_NAME = "omu-fusion-no-cache-v2";
const urlsToCache = [];

// Install event - cache critical resources
self.addEventListener("install", (event) => {
  // Force activation immediately
  self.skipWaiting();
  event.waitUntil(Promise.resolve());
});

// Fetch event - serve from cache with network fallback
// No fetch handler: let the network and HTTP caching handle everything

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  // Clear all existing caches to avoid stale assets and take control
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k)))).then(
      () => self.clients.claim()
    )
  );
});
