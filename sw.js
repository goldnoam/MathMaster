// Service Worker for Offline Access
const CACHE_NAME = 'mathmaster-v1';

// Assets to cache immediately
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/constants.ts',
  '/services/geminiService.ts',
  '/services/storageService.ts',
  '/components/Navigation.tsx',
  '/components/Breadcrumbs.tsx',
  '/components/Footer.tsx',
  '/components/GradeSelector.tsx',
  '/components/TopicSelector.tsx',
  '/components/LessonView.tsx',
  '/components/QuizView.tsx',
  '/components/LoadingSpinner.tsx',
  // External CDNs used in index.html and import map
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;700&display=swap',
  // Critical dependencies for offline functionality
  'https://aistudiocdn.com/@google/genai@^1.30.0',
  'https://aistudiocdn.com/react@^19.2.0',
  'https://aistudiocdn.com/react-dom@^19.2.0',
  'https://aistudiocdn.com/react-markdown@^10.1.0'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('SW: Caching App Shell');
      return cache.addAll(PRECACHE_ASSETS).catch(err => {
          console.warn('SW: Failed to cache some assets', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('SW: Clearing old cache');
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Strategy: Stale-While-Revalidate for most things, or Cache First
  // For simplicity and offline priority: Cache First, then Network
  
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        // Don't cache API calls or bad responses
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          // Check if it's an external CDN (type 'cors') that we want to cache
          if (networkResponse.type === 'cors' && 
             (event.request.url.includes('cdn.tailwindcss') || 
              event.request.url.includes('fonts.googleapis') || 
              event.request.url.includes('fonts.gstatic') ||
              event.request.url.includes('aistudiocdn'))) {
             // continue to cache
          } else {
             return networkResponse;
          }
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      });
    })
  );
});