const CACHE_NAME = 'pedicalc-v1.0.0';
const STATIC_CACHE_URLS = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Cache medication data for offline use
const MEDICATION_DATA = [
  {
    id: 1,
    name: 'Amoxicillin',
    category: 'Antibiotics',
    concentrations: ['125 mg/5 mL', '200 mg/5 mL'],
    dosage: { min: 20, max: 40, unit: 'mg/kg/day' },
    frequency: 'Every 8 hours',
    maxDose: '1000 mg/dose',
    description: 'Beta-lactam antibiotic for bacterial infections'
  },
  {
    id: 2,
    name: 'Azithromycin',
    category: 'Antibiotics',
    concentrations: ['100 mg/5 mL', '200 mg/5 mL'],
    dosage: { min: 10, max: 12, unit: 'mg/kg/day' },
    frequency: 'Once daily',
    maxDose: '500 mg/dose',
    description: 'Macrolide antibiotic for respiratory infections'
  },
  {
    id: 3,
    name: 'Ibuprofen',
    category: 'Analgesics',
    concentrations: ['50 mg/1.25 mL', '100 mg/5 mL'],
    dosage: { min: 5, max: 10, unit: 'mg/kg/dose' },
    frequency: 'Every 6-8 hours',
    maxDose: '400 mg/dose',
    description: 'NSAID for pain and inflammation'
  },
  {
    id: 4,
    name: 'Ceftriaxone',
    category: 'Antibiotics',
    concentrations: ['500 mg'],
    dosage: { min: 50, max: 100, unit: 'mg/kg/day' },
    frequency: 'Once daily',
    maxDose: '2000 mg/dose',
    description: 'Third-generation cephalosporin'
  },
  {
    id: 5,
    name: 'Acetaminophen',
    category: 'Analgesics',
    concentrations: ['80 mg/0.8 mL', '160 mg/5 mL'],
    dosage: { min: 10, max: 15, unit: 'mg/kg/dose' },
    frequency: 'Every 4-6 hours',
    maxDose: '650 mg/dose',
    description: 'Analgesic and antipyretic'
  },
  {
    id: 6,
    name: 'Prednisolone',
    category: 'Corticosteroids',
    concentrations: ['15 mg/5 mL'],
    dosage: { min: 1, max: 2, unit: 'mg/kg/day' },
    frequency: 'Twice daily',
    maxDose: '40 mg/dose',
    description: 'Anti-inflammatory corticosteroid'
  }
];

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
        // Cache medication data
        return caches.open(CACHE_NAME).then(cache => {
          cache.put('/api/medications', new Response(JSON.stringify(MEDICATION_DATA), {
            headers: { 'Content-Type': 'application/json' }
          }));
        });
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
  // Handle medication API requests
  if (event.request.url.includes('/api/medications')) {
    event.respondWith(
      caches.match('/api/medications')
        .then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Fallback to network if not in cache
          return fetch(event.request);
        })
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
              return caches.match('/');
            }
          });
      })
  );
});

// Background sync for calculation history (future feature)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-calculations') {
    console.log('PediCalc SW: Background sync triggered');
    // Handle background sync for calculation history
  }
});

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