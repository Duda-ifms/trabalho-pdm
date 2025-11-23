importScripts("https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js");

workbox.routing.registerRoute(
  ({ request }) => request.destination === "document",
  new workbox.strategies.NetworkFirst()
);

workbox.routing.registerRoute(
  ({ request }) => request.destination === "script" ||
                   request.destination === "style",
  new workbox.strategies.CacheFirst()
);

workbox.routing.registerRoute(
  ({ request }) => request.destination === "image",
  new workbox.strategies.StaleWhileRevalidate()
);

workbox.precaching.precacheAndRoute([
  { url: "/", revision: null },
  { url: "/index.html", revision: null },
  { url: "/offline.html", revision: null },
  { url: "css/style.css", revision: null },
  { url: "js/main.js", revision: null }
]);
