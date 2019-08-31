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
	get size() {
		return this.getSize();
	}
	set size(option) {
		this.setSize(option);
	}
	setSize(option) {
		this.getSize = getSizeWrapper(option);
	}
	draw(context, drawChildren = true) {
		if(! this.visible) return;
		super.draw(context, false);
		
		context.fillStyle = this.color.getString();
		
		let {style, weight, font} = this;
		
		context.textAlign = "center";
		context.textBaseline = "middle";
		
		if(typeof font == "string") font = [font];
		font = font.map(font => `"${font}"`);
		
		context.font = `${style} ${weight} ${this.getSize()}px ${font.join(" ")}`;
		let {
			x,
			y,
			width,
			height
		} = this.getBound();
		context.fillText(this.content, x + width / 2, y + height / 2);
		
		if(drawChildren) this.drawChildren(context);
	}
}
export function getSizeWrapper(option) {
	if(typeof option == "number") {
		return function() {
			return option;
		};
	}
	let {getSize} = option;
	if(getSize) return getSize;
	let {size = 10, isSizeRelative = false} = option;
	return function() {
		if(isSizeRelative) {
			return size * this.getBound().height;
		}else {
			return size;
		}
	}
}