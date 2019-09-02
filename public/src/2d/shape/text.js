import Object2D from "../object2d.js";
import Color from "../color.js";
//TODO: text alignment and text wrapping
export default class Text extends Object2D{
	constructor(option) {
		super(option);
		let {
			style = "",
			weight = "",
			font = "sans-serif",
			color = "#000",
			content
		} = option;
		this.content = content;
		this.style = style;
		this.weight = weight;
		this.font = font;
		this.color = color instanceof Color ? color : new Color(color);
		this.setSize(option);
	}
	setSize(option) {
		this.updateSize = updateSizeWrapper(option);
	}
	draw(context, drawChildren = true) {
		if(! this.visible) return;
		super.draw(context, false);
		context.fillStyle = this.color.getString();
		this.updateSize();
		let {
			size,
			style,
			weight,
			font
		} = this;
		context.textAlign = "center";
		context.textBaseline = "middle";
		if(typeof font == "string") font = [font];
		font = font.map(font => `"${font}"`);
		context.font = `${style} ${weight} ${size}px ${font.join(" ")}`;
		this.updateBound();
		let {
			x,
			y,
			width,
			height
		} = this;
		context.fillText(this.content, x + width / 2, y + height / 2);
		if(drawChildren) this.drawChildren(context);
	}
}
export function updateSizeWrapper(option) {
	if(typeof option == "number") {
		return function() {
			return option;
		};
	}
	let {updateSize} = option;
	if(updateSize) return updateSize;
	let {size = 10, isSizeRelative = false} = option;
	return function() {
		if(isSizeRelative) {
			this.size = size * this.height;
		}else {
			this.size = size;
		}
	}
}
