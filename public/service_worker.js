const cacheName = "tagalogy-cache-1";
const path = `\
/
/index.html
/dist/main.js

/asset/main.css
/asset/font.css

/asset/comicneue_angular/bold_italic.otf
/asset/comicneue_angular/bold.otf
/asset/comicneue_angular/italic.otf
/asset/comicneue_angular/light_italic.otf
/asset/comicneue_angular/light.otf
/asset/comicneue_angular/regular.otf

/asset/bulb.png
/asset/title.png
/asset/title_dark.png

/asset/word_3.txt
/asset/word_4.txt
/asset/word_5.txt
/asset/word_6.txt

/asset/sfx/advance.mp3
/asset/sfx/click.mp3
/asset/sfx/fail.mp3
/asset/sfx/game_over.mp3

/icon/16.png
/icon/32.png
/icon/192.png
/icon/512.png`
    .trim()
    .split(/\s+/);
async function preCache() {
    const cache = await caches.open(cacheName);
    await cache.addAll(path);
}
async function deleteUnneededCache() {
    for (const key of await caches.keys()) {
        if (cacheName !== key) await caches.delete(key);
    }
}
async function fromCache(request) {
    const cached = await caches.match(request);
    if (cached) return cached;
    return await fetch(request);
}
async function update(request) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    if (!cached) return;
    let response;
    try {
        response = await fetch(request);
        if (!response.ok) {
            return;
        }
    } catch (error) {
        return;
    }
    cache.put(request, response);
}
self.addEventListener("install", (event) => {
    event.waitUntil(preCache());
});
self.addEventListener("activate", (event) => {
    event.waitUntil(deleteUnneededCache());
});
self.addEventListener("fetch", (event) => {
    const { request } = event;
    event.respondWith(fromCache(event.request));
    event.waitUntil(update(request));
});
