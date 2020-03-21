export function loadAudio(src: string): Promise<HTMLAudioElement> {
    return new Promise<HTMLAudioElement>((resolve, reject) => {
        const audio = new Audio(src);
        audio.addEventListener("canplaythrough", () => {
            resolve(audio);
        });
        audio.addEventListener("error", () => {
            reject(`Unable to load Audio from ${src}`);
        });
    });
}
export function loadAllAudio(srcs: string[]): Promise<HTMLAudioElement[]> {
    return Promise.all(srcs.map(src => loadAudio(src)));
}