// Zuhause Service Worker — v1
const CACHE = 'zuhause-v1';
const PRECACHE = [
  '/Isa-Lucas/',
  '/Isa-Lucas/index.html',
  '/Isa-Lucas/icon-192.png',
  '/Isa-Lucas/icon-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Network first for Supabase/API calls, cache first for app shell
  if (e.request.url.includes('supabase') || e.request.url.includes('api.anthropic')) {
    return; // Always network for data
  }
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
