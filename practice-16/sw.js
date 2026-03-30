const APP_SHELL_CACHE = "practice16-app-shell-v1";
const DYNAMIC_CACHE = "practice16-dynamic-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.json",
  "./content/home.html",
  "./content/about.html",
  "./icons/favicon.ico",
  "./icons/icon-16.png",
  "./icons/icon-32.png",
  "./icons/icon-64.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(APP_SHELL_CACHE)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== APP_SHELL_CACHE && key !== DYNAMIC_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;

  if (url.pathname.startsWith("/content/")) {
    event.respondWith(
      fetch(event.request)
        .then((networkRes) => {
          const copy = networkRes.clone();
          caches
            .open(DYNAMIC_CACHE)
            .then((cache) => cache.put(event.request, copy));
          return networkRes;
        })
        .catch(() =>
          caches
            .match(event.request)
            .then((cached) => cached || caches.match("./content/home.html")),
        ),
    );
    return;
  }

  event.respondWith(
    caches
      .match(event.request)
      .then((cached) => cached || fetch(event.request)),
  );
});

self.addEventListener("push", (event) => {
  let data = { title: "Новое уведомление", body: "" };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (_) {
      data.body = event.data.text();
    }
  }
  const options = {
    body: data.body,
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-64.png",
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});
