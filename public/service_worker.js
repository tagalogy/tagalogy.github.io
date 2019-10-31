let cacheName = "tagalogy-cache";
let path = `

    /
    /index.html
    /src_min/main.js

    /asset/font.css
    /asset/comicnueue_angular/bold_italic.otf
    /asset/comicnueue_angular/bold.otf
    /asset/comicnueue_angular/italic.otf
    /asset/comicnueue_angular/light_italic.otf
    /asset/comicnueue_angular/light.otf
    /asset/comicnueue_angular/regular.otf

    /asset/bulb.png
    /asset/title.png
    /asset/title_dark.png

    /asset/word_3.txt
    /asset/word_4.txt
    /asset/word_5.txt
    /asset/word_6.txt

    /icon/16.png
    /icon/32.png
    /icon/192.png
    /icon/512.png

`.trim().split(/\s+/);
async function preCache() {
    let cache = await caches.open(cacheName);
    await cache.addAll(path);
}
async function deleteUnneededCache() {
    for(let key of await caches.keys()) if(cacheName !== key) await caches.delete(key);
}
async function fromCache(request) {
    let cached = await caches.match(request);
    if(cached) return cached;
    return await fetch(request);
}
async function update(request) {
    let cache = await caches.open(cacheName);
    let cached = await cache.match(request);
    if(! cached) return;
    let response;
    try{
        response = await fetch(request)
    }catch(error) {
        return;
    }
    cache.put(request, response);
}
self.addEventListener("install", event => {
    event.waitUntil(preCache());
});
self.addEventListener("activate", event => {
    event.waitUntil(deleteUnneededCache());
});
self.addEventListener("fetch", event => {
    let {request} = event;
    event.respondWith(fromCache(event.request));
    event.waitUntil(update(request));
});