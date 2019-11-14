export function loadAudio(src) {
    return new Promise((resolve, reject) => {
        let audio = new Audio(src);
        audio.addEventListener("canplaythrough", () => {
            resolve(audio);
        });
        audio.addEventListener("error", () => {
            reject(`Unable to load Audio from ${src}`);
        });
    });
}
export function loadAllAudio(srcs) {
    return Promise.all(srcs.map(src => loadAudio(src)));
}