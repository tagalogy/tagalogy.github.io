import Base from "./base.js";
import {
	sine,
	alphaToRange,
	now
} from "../easing.js";
import timeout from "../../timeout.js";
export default class FreeForm extends Base {
	constructor(option = {}) {
		super(option);
        let {
            path = []
        } = option;
        this.path = path;
		this.coordsAnimID = -1;
	}
	draw(context, drawChildren = true) {
		if(! this.visible) return;
		super.draw(context, false);
        this.updateBound();
        let {
            x,
            y,
            width,
            height,
            path
        } = this;
		context.beginPath();
        let [
            first
        ] = path;
        context.moveTo(x + first[0] * width, y + first[1] * height);
        for(let ind = 1, len = path.length; ind < len; ind ++) {
            context.lineTo(x + path[ind][0] * width, y + path[ind][1] * height);
        }
        context.closePath();
        context.fill();
		context.stroke();
		if(drawChildren) this.drawChildren(context);
	}
}
