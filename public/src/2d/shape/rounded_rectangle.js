import Base from "./base.js";
let min = Math.min;
export default class RoundedRectangle extends Base{
	constructor(option) {
		super(option);
		this.setRadius(option);
	}
	setRadius(option) {
		this.updateRadius = updateRadiusWrapper(option);
	}
	draw(context, drawChildren = true) {
		if(! this.visible) return;
		super.draw(context, false);
		this.updateBound();
		this.updateRadius();
		let {
			raius,
			x: minX,
			y: minY,
			width,
			height
		} = this;
		let midX = minX + width / 2;
		let midY = minY + height / 2;
		let maxX = minX + width;
		let maxY = minY + height;
		context.beginPath();
		context.moveTo(midX, minY);
		context.arcTo(maxX, minY, maxX, midY, radius);
		context.lineTo(maxX, midY);
		context.arcTo(maxX, maxY, midX, maxY, radius);
		context.lineTo(midX, maxY);
		context.arcTo(minX, maxY, minX, midY, radius);
		context.lineTo(minX, midY);
		context.arcTo(minX, minY, midX, minY, radius);
		context.closePath();
		context.fill();
		context.stroke();
		if(drawChildren) this.drawChildren(context);
	}
}
export function updateRadiusWrapper(option) {
	if(typeof option == "number")  {
		return function() {
			return option;
		};
	}
	let {updateRadius} = option;
	if(updateRadius) return updateRadius;
	let {
		radius = 0,
		isRadiusRelative = false
	} = option;
	return function() {
		if(isRadiusRelative) {
			this.updateBound();
			let {
				width,
				height
			} = this;
			this.radius = min(width, height) * radius;
			return;
		}
		this.radius = radius;
	}
}
