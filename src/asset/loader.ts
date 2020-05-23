import { toArray } from "../utils/collection";
import { voidifyPromise } from "../utils/promise";

abstract class Loader<Paths extends string, Asset> {
    private assets = new Map<Paths, Asset>();
    allLoaded = false;
    promise: Promise<void>;

    constructor(paths: Paths[]) {
        const allPromises: Promise<Asset>[] = [];
        for (const path of paths) {
            const promise = this.load(path);
            promise.then(asset => {
                this.assets.set(path, asset);
            });
            allPromises.push(promise);
        }
        this.promise = voidifyPromise(Promise.all(allPromises));
        this.promise.then(() => {
            this.allLoaded = true;
        });
    }
    protected abstract load(path: Paths): Promise<Asset>;
    get(path: Paths): Asset {
        if (!this.allLoaded) {
            throw new Error("Assets not yet loaded");
        }
        const asset = this.assets.get(path);
        if (asset == null) {
            throw new Error(
                `Reached supposedly unreachable code: ${path} isn't preloaded.`,
            );
        }
        return asset;
    }
}
export class ImageLoader<Paths extends string> extends Loader<
    Paths,
    HTMLImageElement
> {
    protected load(path: Paths): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.src = path;
            image.addEventListener("load", () => {
                resolve(image);
            });
            image.addEventListener("error", () => {
                reject(`Unable to load image from ${path}`);
            });
        });
    }
}
export class AudioLoader<Paths extends string> extends Loader<
    Paths,
    HTMLAudioElement
> {
    protected load(path: Paths): Promise<HTMLAudioElement> {
        return new Promise<HTMLAudioElement>((resolve, reject) => {
            const audio = new Audio(path);
            audio.addEventListener("canplaythrough", () => {
                resolve(audio);
            });
            audio.addEventListener("error", () => {
                reject(`Unable to load Audio from ${path}`);
            });
        });
    }
}
async function getHttp(path: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.addEventListener("load", () => {
            if (xhr.status === 200) {
                resolve(xhr.responseText);
            } else {
                reject(xhr.status);
            }
        });
        xhr.addEventListener("error", () => {
            reject();
        });
        xhr.open("GET", path);
        xhr.send();
    });
}
export class TextLoader<Paths extends string> extends Loader<Paths, string> {
    protected load(path: Paths): Promise<string> {
        return getHttp(path);
    }
}
export class WordLoader<Paths extends string> extends Loader<Paths, string[]> {
    protected async load(path: Paths): Promise<string[]> {
        return toArray(await getHttp(path));
    }
}
