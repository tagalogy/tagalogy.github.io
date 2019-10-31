export function loadImage(src, alt = "") {
    return new Promise((resolve, reject) => {
        let image = new Image;
        image.src = src;
        image.alt = alt;
        image.addEventListener("load", function () {
            resolve(image);
        });
        image.addEventListener("error", function () {
            reject(`Unable to load ${alt} from ${src}`);
        });
    });
}
export function loadImages(srcs) {
    return Promise.all(srcs.map(src => loadImage(src)));
}
