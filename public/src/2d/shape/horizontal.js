import Line from "./line.js";
export default class Horizontal extends Line {
	constructor(option = {}) {
		super(option);
		this.setCoords({
			x0: 0,
			y0: 1 / 2,
			x1: 1,
			y1: 1 / 2
		});
	}
}
