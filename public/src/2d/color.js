import {
	sine,
	alphaToRange,
	now
} from "./easing.js";
import timeout from "../timeout.js";
export default class Color{
	constructor(option = {}) {
		this.colorAnimID = -1;
		this.setColor(option);
	}
	getString() {
		this.updateColor();
		let {
			red,
			green,
			blue,
			alpha
		} = this;
		return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
	}
	toString() {
		return this.getString();
	}
	setColor(option) {
		this.updateColor = updateColorWrapper(option);
	}
	animateColor(option, time, easing) {
		return this.animateUpdateColor(updateColorWrapper(option), time, easing);
	}
	animateUpdateColor(updateColor, time = 400, easing = sine) {
		clearTimeout(this.colorAnimID);
		let oldUpdateColor = this.updateColor;
		let startTime = now();
		this.updateColor = function() {
			let alpha = easing((now() - startTime) / time);
			oldUpdateColor.call(this);
			let {
				red: oldRed,
				green: oldGreen,
				blue: oldBlue,
				alpha: oldAlpha
			} = this;
			updateColor.call(this);
			let {
				red: newRed,
				green: newGreen,
				blue: newBlue,
				alpha: newAlpha
			} = this;
			this.red = alphaToRange(alpha, oldRed, newRed);
			this.green = alphaToRange(alpha, oldGreen, newGreen);
			this.blue = alphaToRange(alpha, oldBlue, newBlue);
			this.alpha = alphaToRange(alpha, oldAlpha, newAlpha);
		};
		this.colorAnimID = setTimeout(() => {
			this.updateColor = updateColor;
		}, time);
		return timeout(time);
	}
}
export function updateColorWrapper(option) {
	if(typeof option == "string") {
		option = option.trim();
		let red, green, blue;
		if(option[0] == "#") {
			let rawString = option.substr(1);
			let raw = parseInt(rawString, 16);
			let red, green, blue, alpha
			switch(rawString.length) {
				case 3:
					red = ((raw >> 2 * 4) & 0xf) * 0x11;
					green = ((raw >> 1 * 4) & 0xf) * 0x11;
					blue = ((raw >> 0 * 4) & 0xf) * 0x11;
					alpha = 1;
					break;
				case 4:
					red = ((raw >> 3 * 4) & 0xf) * 0x11;
					green = ((raw >> 2 * 4) & 0xf) * 0x11;
					blue = ((raw >> 1 * 4) & 0xf) * 0x11;
					alpha = ((raw >> 0 * 4) & 0xf) / 0xf;
					break;
				case 6:
					red = (raw >> 4 * 4) & 0xff;
					green = (raw >> 2 * 4) & 0xff;
					blue = (raw >> 0 * 4) & 0xff;
					alpha = 1;
					break;
				case 8:
					red = (raw >> 6 * 4) & 0xff;
					green = (raw >> 4 * 4) & 0xff;
					blue = (raw >> 2 * 4) & 0xff;
					alpha = ((raw >> 0 * 4) & 0xff) / 0xff;
					break;
			}
			return function() {
				this.red = red;
				this.green = green;
				this.blue = blue;
				this.alpha = alpha;
			}
		}
	}
	let {
		updateColor
	} = option;
	if(updateColor) return updateColor;
	let {
		red = 255,
		green = 255,
		blue = 255,
		alpha = 1
	} = option;
	return function() {
		this.red = red;
		this.green = green;
		this.blue = blue;
		this.alpha = alpha;
	}
}
