const CACHE_NAME = "media-tools-v1";
const PRECACHE_ASSETS = [
  "/",
  "/manifest.webmanifest",
  "/assets/css/main.css",
  "/assets/css/navigation.css",
  "/assets/css/responsive.css",
  "/assets/icons/icon-192.png",
  "/assets/icons/icon-512.png"
];

// Install: Pre-cache core shell resiliently (logs missing files without failing install)
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      const results = await Promise.allSettled(
        PRECACHE_ASSETS.map(async (url) => {
          const response = await fetch(url, { cache: "reload" });
          if (!response.ok) {
            throw new Error(`HTTP ${response.status} for ${url}`);
          }
          return cache.put(url, response);
        })
      );

      results.forEach((result, index) => {
        if (result.status === "rejected") {
          console.warn(`[SW] Skipped precaching ${PRECACHE_ASSETS[index]}:`, result.reason);
        }
      });
    })
  );
  self.skipWaiting();
});