import {
	loadImages
} from "./2d/load_image.js";
import Color from "./2d/color.js";
export let images = {};
export let assets = loadImages([
	"./asset/title.png",
	"./asset/pause.png",
]);
assets.then(rawImages => {
	images.TITLE_PNG = rawImages[0];
	images.PAUSE_PNG = rawImages[1];
	console.log(images);
});
export let colors = {
	WHITE: new Color("#fff"),
	BLACK: new Color("#000"),
	PH_BLUE: new Color("#0038a8"),
	SKY_BLUE: new Color("#0f5fff"),
	PH_RED: new Color("#ce1126"),
	PH_YELLOW: new Color("#fdc116"),
};
