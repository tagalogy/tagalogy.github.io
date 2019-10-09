let cacheName = "tagalogy-cache-03";
let path = `
    /
    /index.html
    /src_min/main.js
    /asset/comicnueue_angular/bold_italic.otf
    /asset/comicnueue_angular/bold.otf
    /asset/comicnueue_angular/italic.otf
    /asset/comicnueue_angular/light_italic.otf
    /asset/comicnueue_angular/light.otf
    /asset/comicnueue_angular/regular.otf
    /asset/font.css
    /asset/bulb.png
    /asset/title.png
    /asset/title_dark.png
    /asset/word_3.txt
    /asset/word_4.txt
    /asset/word_5.txt
    /asset/word_6.txt
    /icon/16.png
    /icon/32.png
    /icon/64.png
    /icon/128.png
    /icon/256.png
    /icon/1024.png
    /icon/2048.png
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
