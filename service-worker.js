const CACHE_NAME = 'kinki-poke-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
];

// Installazione del Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            // console.log('Cache aperta');
            return cache.addAll(urlsToCache);
        })
    );
});

// Attivazione e aggiornamento
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames =>
            Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        // console.log('Cache vecchia eliminata:', cache);
                        return caches.delete(cache);
                    }
                })
            )
        )
    );
});

// Intercettazione delle richieste di rete
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});
