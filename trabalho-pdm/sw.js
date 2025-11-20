
import { warmStrategyCache } from 'workbox-recipes';
import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { registerRoute, Route } from 'workbox-routing';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';


const pageCache = new CacheFirst({
  cacheName: 'pwa-roteiro-cache',
  plugins: [
    new CacheableResponsePlugin({
      statuses: [0, 200],
    }),
    new ExpirationPlugin({
      maxAgeSeconds: 30 * 24 * 60 * 60, // 30 dias
    }),
  ],
});

// Pré-aquecendo cache
warmStrategyCache({
  urls: ['/index.html', '/', '/offline.html'],
  strategy: pageCache,
});

// Rota principal (navegação)
registerRoute(
  ({ request }) => request.mode === 'navigate',
  async ({ event }) => {
    try {
      return await pageCache.handle({ event });
    } catch (error) {
      return caches.match('/offline.html');
    }
  }
);

// ------------------------------
// CACHE DO CSS / JS ESTÁTICOS
// ------------------------------
registerRoute(
  ({ request }) =>
    request.destination === 'script' ||
    request.destination === 'style',

  new StaleWhileRevalidate({
    cacheName: 'static-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// ------------------------------
// CACHE DAS IMAGENS E ÍCONES
// ------------------------------
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'image-cache',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
    ],
  })
);

// ------------------------------
// CACHE DO MAPA (Leaflet)
// ------------------------------
registerRoute(
  ({ url }) =>
    url.origin.includes('tile.openstreetmap.org') ||
    url.href.includes('leaflet'),

  new CacheFirst({
    cacheName: 'map-cache',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 dias
      }),
    ],
  })
);

