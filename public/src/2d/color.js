import {sine, alphaToRange, now} from "./easing.js";
import timeout from "./timeout.js";
export default class Color{
	constructor(option) {
		this.colorAnimID = -1;
		this.setColor(option);
	}
	getString() {
		let {
			red,
			green,
			blue,
			alpha
		} = this.getColor();
		return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
	}
	toString() {
		return this.getString();
	}
	setColor(option) {
		this.getColor = getColorWrapper(option);
	}
	animateColor(option, time, easing) {
		return this.animateGetColor(getColorWrapper(option), time, easing);
	}
	animateGetColor(getColor, time = 400, easing = sine) {
		clearTimeout(this.colorAnimID);
		let oldGetColor = this.getColor;
		let startTime = now();
		this.getColor = function() {
			let alpha = easing((now() - startTime) / time);
			let oldColor = oldGetColor.call(this);
			let newColor = getColor.call(this);
			return {
				red: alphaToRange(alpha, oldColor.red, newColor.red),
				green: alphaToRange(alpha, oldColor.green, newColor.green),
				blue: alphaToRange(alpha, oldColor.blue, newColor.blue),
				alpha: alphaToRange(alpha, oldColor.alpha, newColor.alpha)
			};
		};
		this.colorAnimID = setTimeout(() => {
			this.getColor = getColor;
		}, time);
		return timeout(time);
	}
}
export function getColorWrapper(option) {
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
				case 6:
					red = (raw >> 4 * 4) & 0xff;
					green = (raw >> 2 * 4) & 0xff;
					blue = (raw >> 0 * 4) & 0xff;
					alpha = 1;
					break;
			}
			return function() {
				return {
					red: red,
					green: green,
					blue: blue,
					alpha: alpha
				};
			};
		}
	}
	let {getColor} = option;
	if(getColor) return getColor;
	let {
		red = 255,
		green = 255,
		blue = 255,
		alpha = 1
	} = option;
	return function() {
		return {
			red: red,
			green: green,
			blue: blue,
			alpha: alpha
		};
	}
}
