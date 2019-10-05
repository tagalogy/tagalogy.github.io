import {
	theme,
	safeArea,
	updateThickness
} from "../main.js";
import Color from "../2d/color.js";
import RoundedRectangle from "../2d/shape/rounded_rectangle.js";
import Text from "../2d/shape/text.js";
import Image from "../2d/shape/image.js";
import FreeForm from "../2d/shape/freeform.js";
import Object2D, {
	updateBoundWrapper
} from "../2d/object2d.js";
import {
	images,
	colors
} from "../asset.js";
import {
	linear,
	expoOut,
	sineIn
} from "../2d/easing.js";
import {
	startGame
} from "./game.js";
import timeout, {
	now
} from "../timeout.js";
let ongoing = false;
let title;
let shine;
let titleBox = new Object2D({
	children: [
		title = new Image({
			x: 0,
			y: 0,
			width: 1,
			height: 1
		}),
		shine = new FreeForm({
			path: [
				[0    , 1],
				[3 / 4, 0],
				[1    , 0],
				[1 / 4, 1]
			],
			opacity: 1 / 4,
			fill: colors.WHITE,
			operation: "source-atop"
		})
	]
});
let buttonLine = new Color;
let buttonFill = new Color;
let buttonColor = new Color;
let startButton = new RoundedRectangle({
	fill: buttonFill,
	line: buttonLine,
	dash: [4, 4],
	dashSpeed: 4 / 1000,
	updateThickness,
	radius: 0.5,
	cap: "flat",
	join: "miter",
	child: new Text({
		x: 0,
		y: 0,
		width: 1,
		height: 1,
		weight: "bold",
		font: "ComicNueue Angular",
		color: buttonColor,
		size: 6 / 10,
		content: "simulan"
	}),
	oninteractup() {
		end();
	}
});
let titleBoxPos = updateBoundWrapper({
	x: 1 / 12,
	y: 0 / 20,
	width: 10 / 12,
	height: 14 / 20
});
let intervalID = -1;
export function start() {
	if(ongoing) return;
	if(theme === "dark") {
		buttonLine.setColor(colors.PH_YELLOW);
		buttonFill.setColor(colors.BACKGROUND);
		buttonColor.setColor(colors.PH_YELLOW);
		title.source = images.TITLE_DARK_PNG;
	}else{
		buttonLine.setColor(colors.FOREGROUND);
		buttonFill.setColor(colors.PH_YELLOW);
		buttonColor.setColor(colors.BLACK);
		title.source = images.TITLE_PNG;
	}
	titleBox.setBound({
		x: 1 / 12,
		y: -16 / 20,
		width: 10 / 12,
		height: 14 / 20,
	});
	titleBox.addTo(safeArea);
	let startTime = now();
	titleBox.animateUpdateBound(function() {
		titleBoxPos.call(this);
		this.y += Math.sin((now() - startTime) / 2000 * Math.PI) * this.height / 64;
	}, 400, expoOut);
	shine.setBound({
		x: -1,
		y: 0,
		width: 1,
		height: 1,
	});
	intervalID = setInterval(() => {
		shine.setBound({
			x: -1,
			y: 0,
			width: 1,
			height: 1,
		});
		shine.animateBound({
			x: 1,
			y: 0,
			width: 1,
			height: 1,
		}, 750, linear);
	}, 4000);
	startButton.setBound({
		x: 1 / 6,
		y: 10 / 10,
		width: 4 / 6,
		height: 1 / 10,
	});
	startButton.addTo(safeArea);
	startButton.animateBound({
		x: 1 / 6,
		y: 7 / 10,
		width: 4 / 6,
		height: 1 / 10,
	}, 400, expoOut);
	ongoing = true;
}
export function end() {
	if(! ongoing) return;
	startButton.animateBound({
		x: 1 / 6,
		y: 10 / 10,
		width: 4 / 6,
		height: 1 / 10
	}, 200, sineIn).then(() => {
		startButton.remove();
	});
	titleBox.animateBound({
		x: 1 / 12,
		y: -16 / 20,
		width: 10 / 12,
		height: 14 / 20
	}, 200, sineIn).then(() => {
		titleBox.remove();
	});
	clearInterval(intervalID);
	timeout(200).then(() => {
		startGame();
	});
	ongoing = false;
}
