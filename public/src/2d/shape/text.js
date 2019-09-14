import Object2D from "../object2d.js";
import Color from "../color.js";
//TODO: text alignment and text wrapping
export default class Text extends Object2D{
	constructor(option = {}) {
		super(option);
		let {
			style = "",
			weight = "",
			font = "sans-serif",
			color = "#000",
			wrap = false,
			align = "center",
			baseline = "middle",
			content = ""
		} = option;
		this.content = content;
		this.style = style;
		this.weight = weight;
		this.font = font;
		this.align = align;
		this.baseline = baseline;
		this.wrap = wrap;
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
			content,
			size,
			style,
			weight,
			font,
			wrap,
			align,
			baseline
		} = this;
		context.textAlign = align;
		context.textBaseline = baseline;
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
		let finalX;
		switch(align) {
			case "left": finalX = x; break;
			case "center": finalX = x + width / 2; break;
			case "right": finalX = x + width; break;
		}
		let finalY;
		switch (baseline) {
			case "top": finalY = y; break;
			case "middle": finalY = y + height / 2; break;
			case "bottom": finalY = y + height; break;
		}
		if(wrap) {
			let lines = getLines(context, content, width);
			let len = lines.length;
			switch(baseline) {
				case "middle": finalY -= len * size / 2; break;
				case "bottom": finalY -= len * size; break;
			}
			for(let ind = 0; ind < len; ind ++) context.fillText(lines[ind], finalX, finalY + size * ind);
		}else{
			context.fillText(content, finalX, finalY);
		}
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
	let {
		size = 10,
		isSizeRelative = true
	} = option;
	return function() {
		if(isSizeRelative) {
			this.size = size * this.height;
		}else {
			this.size = size;
		}
	}
}
let SPACES = /\s+/;
export function getLines(context, text, maxWidth) {
    var words = text.split(SPACES);
    var lines = [];
    var currentLine = words[0];
    for (var i = 1; i < words.length; i++) {
        var word = words[i];
        var width = context.measureText(currentLine + " " + word).width;
        if (width < maxWidth) {
            currentLine += " " + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
}
