import {
	start
} from "./mainmenu.js";
import {
	safeArea,
	updateThickness
} from "../main.js";
import Horizontal from "../2d/shape/horizontal.js";
import {
	sineIn,
	sineOut
} from "../2d/easing.js";
import {
	colors
} from "../asset.js";
let loading = new Horizontal({
	cap: "flat",
	join: "miter",
	line: colors.BLACK,
	dash: [4, 4],
	dashSpeed: 1 / 100,
	updateThickness,
});
// TODO: why a callback parameter?? return a promise instead, or maybe use async
export default function load(promise, callback) {
	loading.addTo(safeArea);
	loading.setBound({
		x: 2 / 6,
		y: 10 / 10,
		width: 2 / 6,
		height: 2 / 10,
	});
	let entrance = loading.animateBound({
		x: 2 / 6,
		y: 8 / 10,
		width: 2 / 6,
		height: 2 / 10
	}, 200, sineOut);
	Promise.all([entrance, promise]).then(() => {
		return loading.animateBound({
			x: 2 / 6,
			y: 10 / 10,
			width: 2 / 6,
			height: 2 / 10
		}, 200, sineIn);
	}).then(() => {
		loading.remove();
		callback();
	});
}
