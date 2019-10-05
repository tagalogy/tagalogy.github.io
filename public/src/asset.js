import {
	loadImages
} from "./2d/load_image.js";
import Color from "./2d/color.js";
export let images = {};
export let assets = loadImages([
	"./asset/title.png",
	"./asset/title_dark.png",
	"./asset/bulb.png",
]);
assets.then(rawImages => {
	images.TITLE_PNG = rawImages[0];
	images.TITLE_DARK_PNG = rawImages[1];
	images.BULB_PNG = rawImages[2];
});
export let colors = {
	BACKGROUND: new Color("#fff"),
	FOREGROUND: new Color("#000"),

	TRANSPARENT: new Color("#0000"),
	WHITE: new Color("#fff"),
	BLACK: new Color("#000"),
	PH_BLUE: new Color("#0038a8"),
	SKY_BLUE: new Color("#0f5fff"),
	PH_RED: new Color("#ce1126"),
	PH_YELLOW: new Color("#fdc116"),
};
