import Object2D from "../object2d.js";
let min = Math.min;
export default class Image extends Object2D{
	constructor(option) {
		super(option);
		this.source = option.source;
		let {
			imageScaling = "fit"
		} = option;
		this.imageScaling = imageScaling;
	}
	draw(context, drawChildren = true) {
		if(! this.visible) return;
		super.draw(context, false);
		let {
			source,
			imageScaling
		} = this;
		let {
			naturalWidth: rawSrcWidth,
			naturalHeight: rawSrcHeight
		} = source;
		let {
			x,
			y,
			width: rawDestWidth,
			height: rawDestHeight
		} = this.getBound();
		if(imageScaling == "fit") {
			let scaleX = rawDestWidth / rawSrcWidth;
			let scaleY = rawDestHeight / rawSrcHeight;
			let scale = min(scaleX, scaleY);
			let width = scale * rawSrcWidth;
			let height = scale * rawSrcHeight;
			context.drawImage(source, x + (rawDestWidth - width) / 2, y + (rawDestHeight - height) / 2, width, height);
		}else if(imageScaling == "fill") {
			//baby shark TODO TODO TODO this
		}
		if(drawChildren) this.drawChildren(context);
	}
}
