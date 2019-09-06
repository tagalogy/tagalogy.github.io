import {
	safeArea,
	updateThickness
} from "../main.js";
import Color from "../2d/color.js";
import RoundedRectangle from "../2d/shape/rounded_rectangle.js";
import Text from "../2d/shape/text.js";
import Image from "../2d/shape/image.js";
import {
	images,
	colors
} from "../asset.js";
import {
	expoOut,
	sineIn
} from "../2d/easing.js";
import {
	startGame
} from "./game.js";
import timeout from "../timeout.js";
let ongoing = false;
let title = new Image;
let buttonColor = new Color;
let startButton = new RoundedRectangle({
	fill: buttonColor,
	cap: "flat",
	join: "miter",
	line: colors.BLACK,
	dash: [4, 4],
	dashSpeed: 4 / 1000,
	updateThickness,
	radius: 0.5,
	child: new Text({
		x: 0,
		y: 0,
		width: 1,
		height: 1,
		weight: "bold",
		font: "ComicNueue Angular",
		color: colors.BLACK,
		size: 6 / 10,
		content: "simulan"
	}),
	oninteractdown() {
		buttonColor.setColor(colors.WHITE);
	},
	oninteractup() {
		buttonColor.setColor(colors.PH_YELLOW);
		end();
	}
});
export function start() {
	if(ongoing) return;
	title.source = images.TITLE_PNG;
	title.setBound({
		x: 1 / 12,
		y: -16 / 20,
		width: 10 / 12,
		height: 14 / 20,
	});
	title.addTo(safeArea);
	title.animateBound({
		x: 1 / 12,
		y: 0 / 20,
		width: 10 / 12,
		height: 14 / 20
	}, 400, expoOut);
	buttonColor.setColor("#fdc116");
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
	title.animateBound({
		x: 1 / 12,
		y: -16 / 20,
		width: 10 / 12,
		height: 14 / 20
	}, 200, sineIn).then(() => {
		title.remove();
	});
	timeout(200).then(() => {
		startGame();
	});
	ongoing = false;
}
