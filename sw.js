// يحفظ ملفات البرنامج على الجهاز ليعمل دون إنترنت بعد أول فتح
const CACHE = 'hudoor-v18';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => {
  // cache:'reload' يتجاوز النسخة المؤقتة في المتصفح ليأخذ أحدث ملفات منشورة
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(u => new Request(u, {cache: 'reload'})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('hudoor-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// الشبكة أولًا (دون النسخة المؤقتة) ثم النسخة المحفوظة عند انقطاع الإنترنت
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin || url.pathname.includes('/jcpa/')) return; // لا علاقة لنا بمنصة JCPA ولا بالمواقع الخارجية
  e.respondWith(
    fetch(e.request, {cache: 'no-cache'}).then(r => {
      if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return r;
    }).catch(() => caches.match(e.request, {ignoreSearch: true}).then(r => r || caches.match('./index.html')))
  );
});
