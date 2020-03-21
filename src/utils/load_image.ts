export function loadImage(src: string, alt = ""): Promise<HTMLImageElement> {
    return new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image;
        image.src = src;
        image.alt = alt;
        image.addEventListener("load", () => {
            resolve(image);
        });
        image.addEventListener("error", () => {
            reject(`Unable to load ${alt} from ${src}`);
        });
    });
}
export function loadImages(srcs: string[]): Promise<HTMLImageElement[]> {
    return Promise.all(srcs.map(src => loadImage(src)));
}
