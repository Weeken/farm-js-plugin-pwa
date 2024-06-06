export const sw_template = (
  filesCacheName: string | number,
  staticFiles: string,
  patten: RegExp
) => `

self.addEventListener('install', function (e) {
  self.skipWaiting()
  e.waitUntil(
    caches.open(${filesCacheName}).then((cache) => {
      console.debug('[FARM_SW] 缓存所有文件:' + JSON.stringify(${staticFiles}))
      return cache.addAll(${staticFiles})
    })
  )
})

self.addEventListener('activate', function (event) {
  event.waitUntil(
    self.clients.claim().then(() => {
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
        console.debug('[FARM_SW] 命中资源:' + request.url)
        return response
      } else {
        return fetch(request).then((response) => {
          return caches.open(${filesCacheName}).then((cache) => {
            console.debug('[FARM_SW] 缓存新资源:' + request.url)
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
