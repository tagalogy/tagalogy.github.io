import Scene from "./2d/scene.js";
import SafeArea from "./2d/safearea.js";
import {
	assets
} from "./asset.js";
import {
	start
} from "./screen/mainmenu.js";
import load from "./screen/loading.js";
export let canvas = document.querySelector("canvas#scene");
export let scene = new Scene({
	fill: "#fff",
	canvas: canvas,
	alpha: false,
	autoresize: true,
	ratio: 1
});
let min = Math.min;
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
