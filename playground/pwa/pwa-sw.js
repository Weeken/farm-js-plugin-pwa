
self.addEventListener('install', function (e) {
  self.skipWaiting()
  e.waitUntil(
    caches.open("/front/pwa/").then((cache) => {
      return cache.addAll(["/front/pwa/static/logo-7e9d40.png","/front/pwa/assets/js/index_d466.ae2b73bf.js.map","/front/pwa/dynamic_resources_map_3f505ead.mjs","/front/pwa/assets/js/index_d6c7.67e04dbb.js","/front/pwa/index.html","/front/pwa/assets/js/index_60d0.29842554.js","/front/pwa/assets/css/index_465f.40296e4e.css.map","/front/pwa/assets/css/index_465f.40296e4e.css","/front/pwa/assets/js/index_a399.1576e581.js","/front/pwa/farm_module_system_4e0c4ebc.mjs","/front/pwa/farm_runtime_resource_5b9859f7.mjs","/front/pwa/static/react-f49548.svg","/front/pwa/assets/js/index_d466.ae2b73bf.js"])
    })
  )
})
self.addEventListener('activate', function (event) {
  event.waitUntil(
    self.clients.claim().then(() => {
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => client.navigate(client.url));
      })
      return caches.keys().then(function (cacheNames) {
        return Promise.all(
          cacheNames
            .filter(function (cacheName) {
              return cacheName != "/front/pwa/"
            })
            .map(function (cacheName) {
              return caches.delete(cacheName)
            })
        )
      })
    })
  )
})
self.addEventListener('fetch', function (e) {
  e.respondWith(proxyRequest(e.request))
})
const isCacheSource = (url) => {
  return /(.html|.js|.mjs|.css|.png|.jpg|.jpeg|.svg|.webp|.svga)$/.test(url) && url.startsWith('https')
}
const proxyRequest = async (request) => {
  if (isCacheSource(request.url)) {
    return caches.match(request).then(function (response) {
      if (response) {
        return response
      } else {
        return fetch(request).then((response) => {
          return caches.open("/front/pwa/").then((cache) => {
            cache.put(request, response.clone())
            return response
          })
        })
      }
    })
  } else {
    return fetch(request)
  }
}
