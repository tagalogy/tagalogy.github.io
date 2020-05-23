import {memoize} from "../utils/memo";
import {voidifyPromise} from "../utils/promise";
import {AudioLoader, ImageLoader, WordLoader} from "./loader";

export const imagePaths = [
    "/asset/title.png",
    "/asset/title_dark.png",
    "/asset/bulb.png",
] as const;

export const wordPaths = [
    "/asset/word_3.txt",
    "/asset/word_4.txt",
    "/asset/word_5.txt",
    "/asset/word_6.txt",
] as const;

export const audioPaths = [
    "/asset/sfx/advance.mp3",
    "/asset/sfx/click.mp3",
    "/asset/sfx/fail.mp3",
    "/asset/sfx/game_over.mp3",
] as const;

export const imageLoader = new ImageLoader(imagePaths.slice());
export const wordLoader = new WordLoader(wordPaths.slice());
export const audioLoader = new AudioLoader(audioPaths.slice());

export const getDifficulty = memoize<"easy" | "medium" | "hard" | "very_hard", string[]>(param => {
    switch (param) {
        case "easy": return wordLoader.get("/asset/word_3.txt");
        case "medium": return [
            ...wordLoader.get("/asset/word_3.txt"),
            ...wordLoader.get("/asset/word_4.txt"),
        ].sort();
        case "hard": return [
            ...wordLoader.get("/asset/word_4.txt"),
            ...wordLoader.get("/asset/word_5.txt"),
        ].sort();
        case "very_hard": return [
            ...wordLoader.get("/asset/word_5.txt"),
            ...wordLoader.get("/asset/word_6.txt"),
        ].sort();
    }
});

export const assetsLoaded = voidifyPromise(Promise.all([imageLoader.promise, wordLoader.promise, audioLoader.promise]));