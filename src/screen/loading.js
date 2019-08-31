import {start} from "./mainmenu.js";

import {safeArea, getThickness} from "../main.js";

import Horizontal from "../2d/shape/horizontal.js";

import {sineIn, sineOut} from "../2d/easing.js";
import {colors} from "../asset.js";

export function load(promise, callback) {
	
	let loading = new Horizontal({
		parent: safeArea,
		
		isPositionRelative: true,
		isScaleRelative: true,
		
		x: 2 / 6,
		y: 10 / 10,
		width: 2 / 6,
		height: 2 / 10,
		
		cap: "flat",
		join: "miter",
		line: colors.BLACK,
		dash: [4, 4],
		dashSpeed: 1 / 100,
		
		getThickness: getThickness,
	});
	
	let entrance = loading.animateBound({
		
		isPositionRelative: true,
		isScaleRelative: true,
		
		x: 2 / 6,
		y: 8 / 10,
		width: 2 / 6,
		height: 2 / 10
	}, 200, sineOut);
	
	Promise.all([entrance, promise]).then(() => {
		return loading.animateBound({
			
			isPositionRelative: true,
			isScaleRelative: true,
			
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
