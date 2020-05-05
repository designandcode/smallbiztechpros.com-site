const version = '20200504161851';
const cacheName = `static::${version}`;

const buildContentBlob = () => {
  return ["/elements","/platforms/wordpress/example-post-15","/platforms/platform-5/example-post-14","/platforms/platform-4/example-post-13","/platforms/weebly/example-post-12","/platforms/squarespace/example-post-11","/platforms/wix/example-post-10","/industries/industry-5/example-post-eight","/industries/industry-4/example-post-seven","/industries/bars-restaurants/example-post-six","/industries/bars-restaurants/","/industries/industry-4/","/industries/industry-5/","/industries/plumbers/","/industries/real-estate/","/industries/","/platforms/platform-4/","/platforms/platform-5/","/platforms/squarespace/","/platforms/weebly/","/platforms/wix/","/platforms/wordpress/","/platforms/","/solutions/business-automation/","/solutions/income-diversity/","/solutions/sales-marketing/","/solutions/","/blog/","/","/manifest.json","/offline","/assets/search.json","/search","/assets/styles.css","/thanks","/redirects.json","/sitemap.xml","/robots.txt","/blog/page2/","/blog/page3/","/blog/page4/","/blog/page5/","/blog/page6/","/blog/page7/","/blog/page8/","/blog/page9/","/feed.xml","/assets/logos/logo.svg", "/assets/default-offline-image.png", "/assets/scripts/fetch.js"
  ]
}

const updateStaticCache = () => {
  return caches.open(cacheName).then(cache => {
    return cache.addAll(buildContentBlob());
  });
};

const clearOldCache = () => {
  return caches.keys().then(keys => {
    // Remove caches whose name is no longer valid.
    return Promise.all(
      keys
        .filter(key => {
          return key !== cacheName;
        })
        .map(key => {
          console.log(`Service Worker: removing cache ${key}`);
          return caches.delete(key);
        })
    );
  });
};

self.addEventListener("install", event => {
  event.waitUntil(
    updateStaticCache().then(() => {
      console.log(`Service Worker: cache updated to version: ${cacheName}`);
    })
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(clearOldCache());
});

self.addEventListener("fetch", event => {
  let request = event.request;
  let url = new URL(request.url);

  // Only deal with requests from the same domain.
  if (url.origin !== location.origin) {
    return;
  }

  // Always fetch non-GET requests from the network.
  if (request.method !== "GET") {
    event.respondWith(fetch(request));
    return;
  }

  // Default url returned if page isn't cached
  let offlineAsset = "/offline/";

  if (request.url.match(/\.(jpe?g|png|gif|svg)$/)) {
    // If url requested is an image and isn't cached, return default offline image
    offlineAsset = "/assets/default-offline-image.png";
  }

  // For all urls request image from network, then fallback to cache, then fallback to offline page
  event.respondWith(
    fetch(request).catch(async () => {
      return (await caches.match(request)) || caches.match(offlineAsset);
    })
  );
  return;
});
