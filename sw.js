const CACHE_NAME = 'mth2168-review-v1';
const CORE_ASSETS = [
  './',
  'index.html',
  'styles.css',
  'manifest.webmanifest',
  'vendor/katex/katex.min.css',
  'vendor/katex/katex.min.js',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png',
  'js/app.js',
  'js/rng.js',
  'js/render.js',
  'js/text.js',
  'js/storage.js',
  'js/practice.js',
  'js/exam.js',
  'js/content/index.js',
  'js/content/util.js',
  'js/content/u1-sets.js',
  'js/content/u2-logic.js',
  'js/content/u3-direct-proof.js',
  'js/content/u4-contrapositive.js',
  'js/content/u5-contradiction.js',
  'js/content/u6-non-conditional.js',
  'js/content/u7-set-proofs.js',
  'js/content/u8-disproof.js',
  'js/content/u-past-paper.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => caches.match('index.html'));
    })
  );
});
