const CACHE_NAME = 'pae-cache-v1';
const urlsToCache = [
  './index.html',
  './registro.html',
  './escaner.html',
  './admin.html',
  './estadisticas.html',
  './css/styles.css',
  './manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        // Usamos addAll de forma segura (ignorando errores de CORS externos)
        return cache.addAll(urlsToCache).catch(err => console.log("Some assets failed to cache", err));
      })
  );
});

self.addEventListener('fetch', event => {
  // Ignorar fetch local a Google Script CORS
  if(event.request.url.includes('script.google.com')) return;
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response; // Return from cache
        }
        return fetch(event.request); // Fetch from network
      })
  );
});
