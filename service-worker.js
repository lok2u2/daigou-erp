const CACHE_NAME =
"erp-cache-v1"

// 需要缓存的文件

const urlsToCache = [

  "./",

  "./index.html",

  "./login.html",

  "./style.css",

  "./app.js",

  "./manifest.json",

  "./icon-192.png",

  "./icon-512.png",

  "https://cdn.jsdelivr.net/npm/chart.js"

]

// =========================
// 安装
// =========================

self.addEventListener(

  "install",

  event => {

    event.waitUntil(

      caches.open(CACHE_NAME)

      .then(cache => {

        console.log(
          "缓存已创建"
        )

        return cache.addAll(
          urlsToCache
        )

      })

    )

  }

)

// =========================
// 请求拦截
// =========================

self.addEventListener(

  "fetch",

  event => {

    event.respondWith(

      caches.match(event.request)

      .then(response => {

        // 有缓存

        if(response){

          return response

        }

        // 没缓存 → 请求网络

        return fetch(
          event.request
        )

      })

    )

  }

)

// =========================
// 更新缓存
// =========================

self.addEventListener(

  "activate",

  event => {

    event.waitUntil(

      caches.keys()

      .then(cacheNames => {

        return Promise.all(

          cacheNames.map(cache => {

            if(

              cache !== CACHE_NAME

            ){

              console.log(
                "删除旧缓存:",
                cache
              )

              return caches.delete(
                cache
              )

            }

          })

        )

      })

    )

  }

)

// =========================
// 推送通知（未来可扩展）
// =========================

self.addEventListener(

  "push",

  event => {

    const options = {

      body:
      "你有新的订单通知",

      icon:
      "./icon-192.png",

      badge:
      "./icon-192.png"

    }

    event.waitUntil(

      self.registration
      .showNotification(

        "中越代购 ERP",

        options

      )

    )

  }

)
