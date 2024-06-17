export const sw_template = (
  filesCacheName: string | number,
  staticFiles: string,
  patten: RegExp
) => `
self.addEventListener('install', function (e) {
  self.skipWaiting()
  e.waitUntil(
    caches.open(${filesCacheName}).then((cache) => {
      return cache.addAll(${staticFiles})
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
              return cacheName != ${filesCacheName}
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
  return ${patten}.test(url) && url.startsWith('https')
}
const proxyRequest = async (request) => {
  if (isCacheSource(request.url)) {
    return caches.match(request).then(function (response) {
      if (response) {
        return response
      } else {
        return fetch(request).then((response) => {
          return caches.open(${filesCacheName}).then((cache) => {
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
`;
