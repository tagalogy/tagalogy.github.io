import Base from "./base.js";
export default class Rectangle extends Base {
	draw(context, drawChildren = true) {
		if(! this.visible) return;
		super.draw(context, false);
		this.updateBound();
		let {
			x,
			y,
			width,
			height
		} = this;
		context.fillRect(x, y, width, height);
		context.strokeRect(x, y, width, height);
		if(drawChildren) this.drawChildren(context);
	}
}
