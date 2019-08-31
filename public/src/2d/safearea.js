import Object2D from "./object2d.js";
let min = Math.min;
export default class SafeArea extends Object2D {
	constructor(option) {
		super(option);
		let {ratio} = option;
		this.getBound = function() {
			let bound = this.parent.getBound();
			let scale = min(bound.width / ratio, bound.height);
			let width = scale * ratio;
			return {
				x: bound.x + (bound.width - width) / 2,
				y: bound.y + (bound.height - scale) / 2,
				width: width,
				height: scale
			};
		};
	}
}
