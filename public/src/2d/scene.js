import Object2D from "./object2d.js";
import Frame from "./frame.js";
export default class Scene extends Object2D {
	constructor(option) {
		super(option);
		this.scene = this;
		let {canvas} = option;
		this.canvas = canvas;
		if(option.autoresize) {
			this.getBound = function() {
				return {
					x: 0,
					y: 0,
					width: canvas.clientWidth,
					height: canvas.clientHeight
				};
			};
		}
		let context = this.context = canvas.getContext("2d");
		this.frame = new Frame(() => {
			let bound = this.getBound();
			canvas.width = bound.width;
			canvas.height = bound.height;
			this.draw(context);
		});
		"click mouseup mousedown mousemove".split(" ").forEach(eventName => {
			canvas.addEventListener(eventName, event => {
				event.preventDefault();
				let {
					pageX: x,
					pageY: y
				} = event;
				this.forEachDescendant(descendant => {
					if(descendant.hitTest(x, y)) {
						descendant.invoke(eventName);
						if(eventName == "mousedown") descendant.invoke("interactdown");
						if(eventName == "mouseup") descendant.invoke("interactup");
					}
				});
			});
		});
		canvas.addEventListener("touchmove", event => {
			event.preventDefault();
		});
		"touchstart touchend".split(" ").forEach(eventName => {
			canvas.addEventListener(eventName, event => {
				event.preventDefault();
				let touches = Array.from(event.changedTouches);
				this.forEachDescendant(descendant => {
					if(touches.some(touch => descendant.hitTest(touch.pageX, touch.pageY))) {
						if(eventName == "touchstart") descendant.invoke("interactdown");
						if(eventName == "touchend") descendant.invoke("interactup");
					}
				});
			});
		});
	}
}
