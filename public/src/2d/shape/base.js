import Object2D from "../object2d.js";
import {
	now
} from "../easing.js";
import Color from "../color.js";
export const TRANSPARENT_OPTION = "#0000";
export default class Base extends Object2D {
	constructor(option) {
		super(option);
		let {
			fill = new Color(TRANSPARENT_OPTION),
			line = new Color(TRANSPARENT_OPTION),
			cap = "butt",
			join = "miter",
			dash = [],
			dashSpeed = 0
		} = option;
		this.fill = fill instanceof Color ? fill : new Color(fill);
		this.line = line instanceof Color ? line : new Color(line);
		this.cap = cap;
		this.join = join;
		this.dash = dash;
		this.dashStartOffset = 0;
		this._dashSpeed = 0;
		this.dashStartTime = now();
		this.dashSpeed = dashSpeed;
		this.setThickness(option);
	}
	setThickness(option) {
		this.updateThickness = updateThicknessWrapper(option);
	}
	/*
	Dash Properties
	*/
	get dash() {
		return this._dash;
	}
	set dash(dash) {
		this._dash = dash;
		let sum = 0;
		for(let num of dash) sum += num;
		this.dashSum = sum;
	}
	/*
	DashSpeed Properties
	*/
	get dashSpeed() {
		return this._dashSpeed;
	}
	set dashSpeed(dashSpeed) {
		this._dashSpeed = dashSpeed;
		this.dashStartOffset = this.getDashOffset();
		this.dashStartTime = now();
	}
	/*
	getDashOffset Method
	*/
	getDashOffset() {
		return ((now() - this.dashStartTime) * this._dashSpeed + this.dashStartOffset) % this.dashSum;
	}
	/*
	draw Method
	*/
	draw(context, drawChildren = true) {
		if(! this.visible) return;
		super.draw(context, false);
		this.updateThickness();
		let {
			fill,
			line,
			cap,
			join,
			thickness,
			dash
		} = this;
		context.fillStyle = fill.getString();
		context.strokeStyle = line.getString();
		context.lineCap = cap;
		context.lineJoin = join;
		context.lineWidth = thickness;
		context.setLineDash(dash.map(num => num * thickness));
		context.lineDashOffset = this.getDashOffset() * thickness;
		if(drawChildren) this.drawChildren(context);
	}
}
export function updateThicknessWrapper(option) {
	if(typeof option == "number") {
		return function() {
			return option;
		};
	}
	let {updateThickness} = option;
	if(updateThickness) return updateThickness;
	let {thickness = 2} = option;
	return function() {
		this.thickness = thickness;
	}
}
