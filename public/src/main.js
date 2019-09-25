import Scene from "./2d/scene.js";
import SafeArea from "./2d/safearea.js";
import Rectangle from "./2d/shape/rectangle.js";
import {
	colors,
	assets
} from "./asset.js";
import {
	start
} from "./screen/mainmenu.js";
import load from "./screen/loading.js";
export let canvas = document.querySelector("canvas#scene");
export let scene = new Scene({
	canvas: canvas,
	autoresize: true,
	child: new Rectangle({
		x: 0,
		y: 0,
		width: 1,
		height: 1,
		z: 2,
		fill: colors.WHITE,
		operation: "destination-over"
	})
});
export let safeArea = new SafeArea({
	ratio: 3 / 5,
	parent: scene
});
export function updateThickness() {
	this.thickness = safeArea.width / 100;
};
load(assets).then(() => {
	start();
});
