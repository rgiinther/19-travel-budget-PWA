const APP_PREFIX = "BudgetTracker-";
const VERSION = "version_01";
const CACHE_NAME = APP_PREFIX + VERSION;
const FILES_TO_CACHE = [
    './index.html',
    './js/index.js',
    './js/idb.js',
    './manifest.json',
    './css/styles.css',
    './icons/icon-192x192.png',
    './icons/icon-512x512.png'
];


//cache resources
self.addEventListener('install', function(e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            console.log('installing cache : ' + CACHE_NAME)
            return cache.addAll(FILES_TO_CACHE)
        })
    )
})

// Delete outdated caches
self.addEventListener('activate', function(e) {
    e.waitUntil(
      caches.keys().then(function(keyList) {

        let cacheKeeplist = keyList.filter(function(key) {
          return key.indexOf(APP_PREFIX);
        });
      
        cacheKeeplist.push(CACHE_NAME);
  
        return Promise.all(
          keyList.map(function(key, i) {
            if (cacheKeeplist.indexOf(key) === -1) {
              console.log('deleting cache : ' + keyList[i]);
              return caches.delete(keyList[i]);
            }
          })
        );
      })
    );
  });

  self.addEventListener("fetch", function (event) {
    // cache all get requests to /api routes
    if (event.request.url.includes("/api/")) {
      event.respondWith(
        caches
          .open(DATA_CACHE_NAME)
          .then((cache) => {
            return fetch(event.request)
              .then((response) => {
                // If response, save it and put in tha cache
                if (response.status === 200) {
                  cache.put(event.request.url, response.clone());
                }
                return response;
              })
              .catch((err) => {
                //if response failed get it from tha cache
                return cache.match(event.request);
              });
          })
          .catch((err) => console.log(err))
      );
      return;
    }
    event.respondWith(
      fetch(event.request).catch(function () {
        return caches.match(event.request).then(function (response) {
          if (response) {
            return response;
          } else if (event.request.headers.get("accept").includes("text/html")) {
            // return the cached home page 
            return caches.match("/");
          }
        });
      })
    );
  });

