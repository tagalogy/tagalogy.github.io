let cacheName = "tagalogy-cache-01";
let path = `
    /
    /index.html
    /asset/comicnueue_angular/bold_italic.otf
    /asset/comicnueue_angular/bold.otf
    /asset/comicnueue_angular/italic.otf
    /asset/comicnueue_angular/light_italic.otf
    /asset/comicnueue_angular/light.otf
    /asset/comicnueue_angular/regular.otf
    /asset/font.css
    /asset/title.png
    /src_min/main.js
`.trim().split(/\s+/);
self.addEventListener("install", event => {
    event.waitUntil(caches.open(cacheName).then(cache => {
        return cache.addAll(path);
    }));
});
self.addEventListener("fetch", event => {
    event.respondWith(caches.match(event.request).then(cache => {
        if(cache) return cache;
        return fetch(event.request).then(response => {
            return caches.open(cacheName).then(cache => {
                cache.put(event.request, request.clone());
                return response;
            });
        });
    }));
});
