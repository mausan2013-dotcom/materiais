// Materiais — service worker: deixa o app abrir sem internet (pátio/oficina sem sinal).
// Estratégia: rede primeiro (pega a versão nova quando há internet), cache como reserva.
const CACHE = 'materiais-v1';
const ARQUIVOS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  // Fonte (Open Sans): guarda na 1ª vez e usa do cache depois, para abrir igual sem internet
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request).then((resp) => {
      const copia = resp.clone();
      caches.open(CACHE).then((c) => c.put(e.request, copia));
      return resp;
    })));
    return;
  }
  if (url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then((resp) => {
        const copia = resp.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copia));
        return resp;
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match('./index.html')))
  );
});

// Notificação para supervisores (enviada pela função notifica-supervisor do Supabase)
self.addEventListener('push', (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (x) { d = { body: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.registration.showNotification(d.title || 'Materiais', {
    body: d.body || '', icon: 'icon-192.png', tag: d.tag, renotify: !!d.tag,
    vibrate: [200, 100, 200], data: { url: d.url || '' }
  }));
});
// Toque na notificação: abre o app (ou traz para frente) já na conferência
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const alvo = new URL('./' + ((e.notification.data && e.notification.data.url) || ''), self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((janelas) => {
    for (const j of janelas) if (j.url.startsWith(self.registration.scope)) return j.focus().then(() => j.navigate(alvo));
    return self.clients.openWindow(alvo);
  }));
});
