let cacheName = "tagalogy-cache";
let path = `

    /
    /index.html
    /src_min/main.js
    /manifest.webmanifest

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
    /icon/64.png
    /icon/128.png
    /icon/256.png
    /icon/1024.png
    /icon/2048.png

`.trim().split(/\s+/);
async function preCache() {
    let allCache = await caches.open(cacheName);
    await allCache.addAll(path);
}
async function deleteUnneededCache() {
    for(let key of await caches.keys()) if(cacheName !== key) await caches.delete(key);
}
async function fromCache(request) {
    let cached = await caches.match(request);
    if(cached) return cached;
    throw "no match";
}
async function update(request) {
    let allCache = await caches.open(cacheName);
    let response;
    try{
        response = await fetch(request);
    }catch(error) {
        return;
    }
    await allCache.put(request, response);
}
self.addEventListener("install", event => {
    event.waitUntil(preCache());
});
self.addEventListener("activate", event => {
    event.waitUntil(deleteUnneededCache());
});
self.addEventListener("fetch", event => {
    let {request} = event;
    event.respondWith(fromCache(request));
    event.waitUntil(update(request));
});