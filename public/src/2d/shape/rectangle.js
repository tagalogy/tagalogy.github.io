import Base from "./base.js";
export default class Rectangle extends Base {
	draw(context, drawChildren = true) {
		if(! this.visible) return;
		super.draw(context, false);
		let {
			x,
			y,
			width,
			height
		} = this.getBound();
		context.fillRect(x, y, width, height);
		context.strokeRect(x, y, width, height);
		if(drawChildren) this.drawChildren(context);
	}
}
