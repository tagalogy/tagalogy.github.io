import {
	theme,
	setTheme,
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
	start as startGame
} from "./difficulty.js";
import timeout, {
	now
} from "../timeout.js";
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
	async oninteractup() {
		await end();
		startGame();
	}
});
let bulb;
let settings = new Object2D({
	children: [
		new Object2D({
			x: 0,
			y: 0,
			width: 1 / 6,
			height: 1,
			child: bulb = new Image({
				x: 1 / 6,
				y: 1 / 6,
				width: 4 / 6,
				height: 4 / 6
			}),
			oninteractup() {
				setTheme(theme === "dark" ? "light" : "dark");
				updateColor();
			}
		})
	]
});
let titleBoxPos = updateBoundWrapper({
	x: 1 / 12,
	y: 0 / 20,
	width: 10 / 12,
	height: 14 / 20
});
function updateColor() {
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
}
let intervalID = -1;
export function start() {
	updateColor();
	bulb.source = images.BULB_PNG;
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
		}, 700, linear);
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
	settings.setOpacity(0);
	settings.animateOpacity(1, 400);
	settings.setBound({
		x: 0 / 6,
		y: 0 / 10,
		width: 6 / 6,
		height: 1 / 10,
	})
	settings.addTo(safeArea);
}
export async function end() {
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
	settings.animateOpacity(0, 200).then(() => {
		settings.remove();
	});
	clearInterval(intervalID);
	await timeout(200);
}
