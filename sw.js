var CACHE_NAME = 'sudoku_v1577187146565';
var urlsToCache = [
  './',
  'index.html',
  'bundle/sudoku.css',
  'bundle/iconfont.css',
  'bundle/iconfont.eot?t=1499406127772',
  'bundle/iconfont.svg?t=1499406127772',
  'bundle/iconfont.ttf?t=1499406127772',
  'bundle/iconfont.woff?t=1499406127772',
  'bundle/sudoku-min.js'
];

self.addEventListener('install', function(event) {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      }).then(function() {
        // Message to simply show the lifecycle flow
        console.log(
          '[install] All required resources have been cached;',
          'the Service Worker was successfully installed!'
        );

        // Force activation
        return self.skipWaiting();
      })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (CACHE_NAME !== cacheName) {
            // If this cache name isn't present in the array of "expected" cache names, then delete it.
            console.log('Deleting out of date cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function() {
      // `claim()` sets this worker as the active worker for all clients that
      // match the workers scope and triggers an `oncontrollerchange` event for
      // the clients.
      console.log('[ServiceWorker] Claiming clients for version', CACHE_NAME);
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }

        return fetch(event.request);
      }
    )
  );
});
