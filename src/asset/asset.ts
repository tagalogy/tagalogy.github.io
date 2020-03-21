import {toArray} from "../utils/collection";
import {getAll} from "../utils/get_http";
import {loadAllAudio} from "../utils/load_audio";
import {loadImages} from "../utils/load_image";
import {SPACE} from "../utils/regex";

// TODO: get rid of these namespaces
export namespace Sfx {
    export let ADVANCE: HTMLAudioElement;
    export let CLICK: HTMLAudioElement;
    export let FAIL: HTMLAudioElement;
    export let GAME_OVER: HTMLAudioElement;
}
export namespace Words {
    export let WORD_3: string[];
    export let WORD_4: string[];
    export let WORD_5: string[];
    export let WORD_6: string[];
}
export namespace Images {
    export let TITLE_PNG: HTMLImageElement;
    export let TITLE_DARK_PNG: HTMLImageElement;
    export let BULB_PNG: HTMLImageElement;
}
export namespace Difficulties {
    export let EASY: string[];
    export let MEDIUM: string[];
    export let HARD: string[];
    export let VERY_HARD: string[];
}
async function loadAll() {
    [
        Images.TITLE_PNG,
        Images.TITLE_DARK_PNG,
        Images.BULB_PNG,
    ] = await loadImages(toArray(`\
/asset/title.png
/asset/title_dark.png
/asset/bulb.png`));
    [
        Words.WORD_3,
        Words.WORD_4,
        Words.WORD_5,
        Words.WORD_6,
    ] = (await getAll(toArray(`\
/asset/word_3.txt
/asset/word_4.txt
/asset/word_5.txt
/asset/word_6.txt`))).map(text => text.split(SPACE));
    Difficulties.EASY = [...Words.WORD_3].sort();
    Difficulties.MEDIUM = [...Words.WORD_3, ...Words.WORD_4].sort();
    Difficulties.HARD = [...Words.WORD_4, ...Words.WORD_5].sort();
    Difficulties.VERY_HARD = [...Words.WORD_5, ...Words.WORD_6].sort();
    [
        Sfx.ADVANCE,
        Sfx.CLICK,
        Sfx.FAIL,
        Sfx.GAME_OVER
    ] = await loadAllAudio(toArray(`\
/asset/sfx/advance.mp3
/asset/sfx/click.mp3
/asset/sfx/fail.mp3
/asset/sfx/game_over.mp3`));
}
export const assetsLoaded = loadAll();