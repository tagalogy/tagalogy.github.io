import {
    loadImages
} from "./2d/load_image.js";
import {
    getAll
} from "./get_http.js";
import Color from "./2d/color.js";
export let words = {};
export let images = {};
export let difficulties = {};
const SPACES = /\s+/;
async function loadAll() {
    [
        images.TITLE_PNG,
        images.TITLE_DARK_PNG,
        images.BULB_PNG
    ] = await loadImages(`
        /asset/title.png
        /asset/title_dark.png
        /asset/bulb.png
    `.trim().split(SPACES));
    [
        words.WORD_3,
        words.WORD_4,
        words.WORD_5,
        words.WORD_6
    ] = (await getAll(`
        /asset/word_3.txt
        /asset/word_4.txt
        /asset/word_5.txt
        /asset/word_6.txt
    `.trim().split(SPACES))).map(text => text.split(SPACES));
    difficulties.EASY = [... words.WORD_3].sort();
    difficulties.MEDIUM = [... words.WORD_3, ... words.WORD_4].sort();
    difficulties.HARD = [... words.WORD_4, ... words.WORD_5].sort();
    difficulties.VERY_HARD = [... words.WORD_5, ... words.WORD_6].sort();
}
export let assets = loadAll();
export let colors = {
    BACKGROUND: new Color("#fff"),
    FOREGROUND: new Color("#000"),
    ACCENT: new Color("#0038a8"),

    TRANSPARENT: new Color("#0000"),
    WHITE: new Color("#fff"),
    BLACK: new Color("#000"),
    PH_BLUE: new Color("#0038a8"),
    SKY_BLUE: new Color("#0f5fff"),
    PH_RED: new Color("#ce1126"),
    PH_YELLOW: new Color("#fdc116"),
};
