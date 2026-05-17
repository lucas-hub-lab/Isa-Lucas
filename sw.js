// Zuhause Service Worker — bump version here on every deploy to force cache refresh
const CACHE_VERSION = 'zuhause-v7';
const PRECACHE = [
  '/Isa-Lucas/',
  '/Isa-Lucas/index.html',
  '/Isa-Lucas/icon-192.png',
  '/Isa-Lucas/icon-512.png',
];

self.addEventListener('install', e => {
  // Skip waiting forces immediate activation on next load
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_VERSION).then(c => c.addAll(PRECACHE))
  );
});

self.addEventListener('activate', e => {
  // Delete all old cache versions
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ── Push Notifications ──
self.addEventListener('push', e => {
  let data = { title: 'Zuhause 🏡', body: 'Neue Nachricht' };
  try { data = e.data?.json() || data; } catch(_) {}
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/Isa-Lucas/icon-192.png',
      badge: '/Isa-Lucas/icon-192.png',
      vibrate: [150, 50, 150],
      data: { url: '/Isa-Lucas/' },
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => {
      const existing = cs.find(c => c.url.includes('/Isa-Lucas/'));
      if (existing) return existing.focus();
      return clients.openWindow('/Isa-Lucas/');
    })
  );
});

self.addEventListener('fetch', e => {
  // Never cache Supabase or Anthropic API calls
  const url = e.request.url;
  if (url.includes('supabase') || url.includes('anthropic') || url.includes('googleapis')) {
    return; // Network only
  }
  // App shell: network first, fall back to cache
  e.respondWith(
    fetch(e.request)
      .then(response => {
        // Update cache with fresh response
        const clone = response.clone();
        caches.open(CACHE_VERSION).then(c => c.put(e.request, clone));
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});
