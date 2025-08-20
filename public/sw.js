const CACHE_NAME = 'pedicalc-v1.2.0';
const STATIC_CACHE_URLS = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/offline.html'
];

// Dynamic cache for Supabase data
let CACHED_MEDICATIONS = null;
let CACHE_TIMESTAMP = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('PediCalc SW: Install event');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('PediCalc SW: Caching static assets');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        console.log('PediCalc SW: Static assets cached');
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('PediCalc SW: Activate event');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('PediCalc SW: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  // Handle Supabase API requests
  if (event.request.url.includes('supabase.co') || event.request.url.includes('/rest/v1/')) {
    event.respondWith(
      handleSupabaseRequest(event.request)
    );
    return;
  }

  // Handle other requests
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          return cachedResponse;
        }

        // Otherwise, fetch from network
        return fetch(event.request)
          .then((networkResponse) => {
            // Don't cache non-successful responses
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // Clone the response
            const responseToCache = networkResponse.clone();

            // Cache the new response
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          })
          .catch(() => {
            // If both cache and network fail, show offline page for navigation requests
            if (event.request.destination === 'document') {
              return caches.match('/offline.html').then(offlinePage => {
                return offlinePage || caches.match('/');
              });
            }
          });
      })
  );
});

// Background sync for calculation history and cache refresh
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-calculations') {
    console.log('PediCalc SW: Background sync for calculations triggered');
    // Handle background sync for calculation history
    event.waitUntil(syncCalculationHistory());
  }
  
  if (event.tag === 'refresh-medications') {
    console.log('PediCalc SW: Background medication refresh triggered');
    event.waitUntil(refreshMedicationCache());
  }
});

async function syncCalculationHistory() {
  // Future implementation for syncing calculation history
  console.log('PediCalc SW: Syncing calculation history (placeholder)');
}

// Push notifications for important updates (future feature)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: 'pedicalc-notification',
      requireInteraction: true,
      actions: [
        {
          action: 'open',
          title: 'Open PediCalc'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'PediCalc Update', options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Handle Supabase requests with smart caching
async function handleSupabaseRequest(request) {
  try {
    // Try network first for fresh data
    const networkResponse = await fetch(request.clone());
    
    if (networkResponse.ok) {
      // Cache the response
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
      
      // Update timestamp for data freshness
      CACHE_TIMESTAMP = Date.now();
      
      return networkResponse;
    }
  } catch (error) {
    console.log('PediCalc SW: Network failed, trying cache', error);
  }
  
  // Fallback to cache
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    console.log('PediCalc SW: Serving from cache');
    return cachedResponse;
  }
  
  // If no cache available, return error response
  return new Response(
    JSON.stringify({ error: 'Network unavailable and no cached data' }),
    {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

// Periodic cache cleanup and refresh
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'REFRESH_CACHE') {
    event.waitUntil(refreshMedicationCache());
  }
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

async function refreshMedicationCache() {
  console.log('PediCalc SW: Refreshing medication cache');
  const cache = await caches.open(CACHE_NAME);
  
  // Clear old medication data
  const keys = await cache.keys();
  for (const key of keys) {
    if (key.url.includes('supabase.co') || key.url.includes('/rest/v1/')) {
      await cache.delete(key);
    }
  }
  
  CACHE_TIMESTAMP = Date.now();
}