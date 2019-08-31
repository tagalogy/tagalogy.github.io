import Line from "./line.js";

export default class Horizontal extends Line {
	constructor(option) {
		super(option);

		this.getCoords = function() {
			let {
				x,
				y,
				width,
				height
			} = this.getBound();

			return {
				x0: x,
				y0: y + height / 2,
				x1: x + width,
				y1: y + height / 2,
			};
		}
	}
}
