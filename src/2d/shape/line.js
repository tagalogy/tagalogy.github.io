import Base from "./base.js";
import {sine, alphaToRange, now} from "../easing.js";
import timeout from "../timeout.js";

export default class Line extends Base {
	constructor(option) {
		super(option);
		
		this.coordsAnimID = -1;
		this.setCoords(option);
	}
	setCoords(option) {
		this.getCoords = getCoordsWrapper(option);
	}
	animateCoords(option, time, easing) {
		return this.animateGetCoords(getCoordsWrapper(option), time, easing);
	}
	animateGetCoords(getCoords, time = 400, easing = SINE) {
		clearTimeout(this.coordsAnimID);
		let oldGetBound = this.getBound;
		let startTime = now();
		
		this.getBound = function() {
			let alpha = easing((now() - startTime) / time);
			let oldBound = oldGetBound.call(this);
			let newBound = getBound.call(this);
			
			return {
				x: alphaToRange(alpha, oldBound.x, newBound.x),
				y: alphaToRange(alpha, oldBound.y, newBound.y),
				width: alphaToRange(alpha, oldBound.width, newBound.width),
				height: alphaToRange(alpha, oldBound.height, newBound.height)
			};
		};
		this.coordsAnimID = setTimeout(() => {
			this.getCoords = getCoords;
		}, time);
		return new timeout(time);
	}
	draw(context, drawChildren = true) {
		if(! this.visible) return;
		super.draw(context, false);
		
		let {
			x0,
			y0,
			x1,
			y1
		} = this.getCoords();
		
		context.beginPath();
		context.moveTo(x0, y0);
		context.lineTo(x1, y1);
		context.stroke();
		
		if(drawChildren) this.drawChildren(context);
	}
}
export function getCoordsWrapper(option) {
	let {getCoords} = option;
	if(getCoords) return getCoords;
	
	let {
		x0 = 0,
		y0 = 0,
		x1 = 0,
		y1 = 0
	} = option;
	
	return function() {
		let {
			x,
			y,
			width,
			height
		} = this.getBound();
		return {
			x0: x + width * x0,
			y0: y + height * y0,
			x1: x + width * x1,
			y1: y + height * y1
		};
	};
}