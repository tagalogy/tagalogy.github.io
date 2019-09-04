import Base from "./base.js";
import {
	sine,
	alphaToRange,
	now
} from "../easing.js";
import timeout from "../../timeout.js";
export default class Line extends Base {
	constructor(option) {
		super(option);
		this.coordsAnimID = -1;
		this.setCoords(option);
	}
	setCoords(option) {
		this.updateCoords = updateCoordsWrapper(option);
	}
	animateCoords(option, time, easing) {
		return this.animateUpdateCoords(getCoordsWrapper(option), time, easing);
	}
	animateUpdateCoords(updateCoords, time = 400, easing = SINE) {
		clearTimeout(this.coordsAnimID);
		let oldUpdateCoords = this.updateCoords;
		let startTime = now();
		this.updateCoords = function() {
			let alpha = easing((now() - startTime) / time);
			oldUpdateCoords.call(this);
			let {
				x0: oldX0,
				y0: oldY0,
				x1: oldX1,
				y1: oldY1
			} = this;
			updateCoords.call(this);
			let {
				x0: newX0,
				y0: newY0,
				x1: newX1,
				y1: newY1
			} = this;
			return {
				x0: alphaToRange(alpha, oldX0, newX0),
				y0: alphaToRange(alpha, oldY0, newY0),
				x1: alphaToRange(alpha, oldX1, newX1),
				y1: alphaToRange(alpha, oldY1, newY1)
			};
		};
		this.coordsAnimID = setTimeout(() => {
			this.updateCoords = updateCoords;
		}, time);
		return new timeout(time);
	}
	draw(context, drawChildren = true) {
		if(! this.visible) return;
		super.draw(context, false);
		this.updateCoords();
		let {
			x0,
			y0,
			x1,
			y1
		} = this;
		context.beginPath();
		context.moveTo(x0, y0);
		context.lineTo(x1, y1);
		context.stroke();
		if(drawChildren) this.drawChildren(context);
	}
}
export function updateCoordsWrapper(option) {
	let {updateCoords} = option;
	if(updateCoords) return updateCoords;
	let {
		x0 = 0,
		y0 = 0,
		x1 = 0,
		y1 = 0
	} = option;
	return function() {
		this.updateBound();
		let {
			x,
			y,
			width,
			height
		} = this;
		this.x0 = x + width * x0;
		this.y0 = y + height * y0;
		this.x1 = x + width * x1;
		this.y1 = y + height * y1;
	};
}
