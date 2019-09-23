import Object2D from "./object2d.js";
import Frame from "./frame.js";
import Color from "./color.js";
export default class Scene extends Object2D {
	constructor(option = {}) {
		super(option);
		this.scene = this;
		let {
			fill = "#0000",
			canvas,
			alpha = true,
			scale = 1
		} = option;
		this.scale = scale;
		this.fill = fill instanceof Color ? fill : new Color(fill);
		this.canvas = canvas;
		if(option.autoresize) {
			this.updateBound = function() {
				this.x = 0;
				this.y = 0;
				this.width = canvas.clientWidth * scale;
				this.height = canvas.clientHeight * scale;
			};
		}
		let context = this.context = canvas.getContext("2d", {
			alpha: alpha,
			antialias: true
		});
		context.imageSmoothingEnabled = true;
		this.frame = new Frame(() => {
			this.draw(context);
			this.invoke("frame");
		});
		"click mouseup mousedown mousemove".split(" ").forEach(eventName => {
			canvas.addEventListener(eventName, event => {
				event.preventDefault();
				let {
					pageX: x,
					pageY: y
				} = event;
				this.forEachDescendant(descendant => {
					if(descendant.hitTest(x * scale, y * scale)) {
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
					if(touches.some(touch => descendant.hitTest(touch.pageX * scale, touch.pageY * scale))) {
						if(eventName == "touchstart") descendant.invoke("interactdown");
						if(eventName == "touchend") descendant.invoke("interactup");
					}
				});
			});
		});
	}
	draw(context, drawChildren = true) {
		if(! this.visible) return;
		super.draw(context, false);
		this.updateBound();
		let {
			canvas,
			width,
			height
		} = this;
		canvas.width = width;
		canvas.height = height;
		context.clearRect(0, 0, width, height);
		context.fillStyle = this.fill.getString();
		context.fillRect(0, 0, width, height);
		if(drawChildren) this.drawChildren(context);
	}
}
