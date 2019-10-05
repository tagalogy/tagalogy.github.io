import EventTarget from "../event.js";
import {
	sine,
	alphaToRange,
	now
} from "./easing.js";
import Scene from "./scene.js";
import timeout from "../timeout.js";
export default class Object2D extends EventTarget{
	constructor(option = {}) {
		super(option);
		this.boundAnimID = -1;
		this.opacityAnimID = -1;
		this.visible = true;
		this.children = [];
		this.parent = null;
		this.scene = null;
		this._z = 0;
		this.setOpacity(option);
		this.setBound(option);
		let {
			parent,
			child,
			children,
			z = 0,
			operation = "source-over"
		} = option;
		this.operation = operation;
		if(parent) this.addTo(parent);
		if(child) this.addChild(child);
		if(children) this.addChildren(children);
		this.z = z;
	}
	/*
	Z Properties
	*/
	get z() {
		return this._z;
	}
	set z(num) {
		this._z = num;
		let {
			parent
		} = this;
		if(parent) parent.updateDrawOrder();
	}
	/*
	Bound Setting and Animating Methods
	*/
	setBound(option) {
		this.updateBound = updateBoundWrapper(option);
	}
	animateBound(option, time, easing) {
		return this.animateUpdateBound(updateBoundWrapper(option), time, easing);
	}
	animateUpdateBound(updateBound, time = 400, easing = sine) {
		clearTimeout(this.boundAnimID);
		let oldUpdateBound = this.updateBound;
		let startTime = now();
		this.updateBound = function() {
			let alpha = easing((now() - startTime) / time);
			oldUpdateBound.call(this);
			let {
				x: oldX,
				y: oldY,
				width: oldWidth,
				height: oldHeight
			} = this;
			updateBound.call(this);
			let {
				x: newX,
				y: newY,
				width: newWidth,
				height: newHeight
			} = this;
			this.x = alphaToRange(alpha, oldX, newX);
			this.y = alphaToRange(alpha, oldY, newY);
			this.width = alphaToRange(alpha, oldWidth, newWidth);
			this.height = alphaToRange(alpha, oldHeight, newHeight);
		};
		this.boundAnimID = setTimeout(() => {
			this.updateBound = updateBound;
		}, time);
		return timeout(time);
	}
	/*
	Opacity Setting and Animating Methods
	*/
	setOpacity(option) {
		this.updateOpacity = updateOpacityWrapper(option);
	}
	animateOpacity(option, time, easing) {
		return this.animateUpdateOpacity(updateOpacityWrapper(option), time, easing);
	}
	animateUpdateOpacity(updateOpacity, time = 400, easing = sine) {
		clearTimeout(time);
		let oldUpdateOpacity = this.updateOpacity;
		let startTime = now();
		this.updateOpacity = function() {
			let alpha = easing((now() - startTime) / time);
			oldUpdateOpacity.call(this);
			let {
				opacity: oldOpacity
			} = this;
			updateOpacity.call(this);
			let {
				opacity: newOpacity
			} = this;
			this.opacity = alphaToRange(alpha, oldOpacity, newOpacity);
		};
		this.opacityAnimID = setTimeout(() => {
			this.updateOpacity = updateOpacity;
		}, time);
		return timeout(time);
	}
	/*
	Shortcut Opacity Animation Methods
	*/
	async fadeIn(time, easing) {
		this.visible = true;
		await animateOpacity(1, time, easing);
	}
	async fadeOut(time, easing) {
		await animateOpacity(0, time, easing);
		this.visible = false;
	}
	/*
	forEachDescendant
	*/
	forEachDescendant(callback, includeThis = false) {
		if(includeThis) callback(this);
		for(let child of this.children) child.forEachDescendant(callback, true);
	}
	/*
	Draw Methods
	*/
	updateDrawOrder(deep = false) {
		let {children} = this;
		children.sort((a, b) => a.z - b.z);
		if(deep) for(let child of children) child.updateDrawOrder(true);
	}
	draw(context, drawChildren = true) {
		if(! this.visible) return;
		this.updateOpacity();
		context.globalAlpha = this.opacity;
		context.globalCompositeOperation = this.operation;
		if(drawChildren) this.drawChildren(context);
	}
	drawChildren(context) {
		for(let child of this.children) child.draw(context);
	}
	/*
	setscene Method
	*/
	setscene(scene) {
		this.scene = scene;
		for(let child of this.children) child.setscene(scene);
	}
	/*
	Tree Methods
	*/
	addChild(child, updateDrawOrder = true) {
		if(child instanceof Scene) throw new Error("Unable to add scene as a child");
		child.invoke("beforeadd");
		child.remove(false);
		child.parent = this;
		child.setscene(this.scene);
		this.children.push(child);
		if(updateDrawOrder) this.updateDrawOrder();
		child.invoke("afteradd");
	}
	addChildren(children, updateDrawOrder = true) {
		for(let child of children) this.addChild(child, false);
		if(updateDrawOrder) this.updateDrawOrder();
	}
	addTo(parent, updateDrawOrder) {
		parent.addChild(this, updateDrawOrder);
	}
	removeChild(child, setscene = true) {
		if(child.parent !== this) return;
		child.invoke("beforeremove");
		child.parent = null;
		if(setscene) child.setscene(null);
		let {children} = this;
		children.splice(children.indexOf(child), 1);
		child.invoke("afterremove");
	}
	remove(setscene = true) {
		let {
			parent
		} = this;
		if(parent) parent.removeChild(this, setscene);
	}
	removeChildren(children) {
		for(let child of children) this.removeChild(child);
	}
	removeAllChildren() {
		this.removeChildren([... this.children]);
	}
	/*
	hitTest Methods
	*/
	hitTest(testX, testY) {
		this.updateBound();
		let {
			x,
			y,
			width,
			height
		} = this;
		return testX > x && testY > y && testX < x + width && testY < y + height;
	}
}
export function updateBoundWrapper(option) {
	let {
		updateBound
	} = option;
	if(updateBound) return updateBound;
	let {
		x = 0,
		y = 0,
		width = 0,
		height = 0,
		isPositionRelative = true,
		isScaleRelative = true
	} = option;
	return function() {
		let {
			parent
		} = this;
		let offsetX, offsetY, offsetWidth, offsetHeight;
		if(parent) {
			parent.updateBound();
			offsetX = isPositionRelative ? parent.x : 0;
			offsetY = isPositionRelative ? parent.y : 0;
			offsetWidth = isScaleRelative ? parent.width : 1;
			offsetHeight = isScaleRelative ? parent.height : 1;
		}else{
			offsetX = 0;
			offsetY = 0;
			offsetWidth = 1;
			offsetHeight = 1;
		}
		this.x = offsetX + offsetWidth * x;
		this.y = offsetY + offsetHeight * y,
		this.width = offsetWidth * width;
		this.height = offsetHeight * height;
	};
}
export function updateOpacityWrapper(option) {
	if(typeof option == "number")  {
		option = {
			opacity: option
		}
	}
	let {
		updateOpacity
	} = option;
	if(updateOpacity) return updateOpacity;
	let {
		opacity = 1,
		isOpacityRelative = true
	} = option;
	return function() {
		let {
			parent
		} = this;
		if(parent && isOpacityRelative) {
			parent.updateOpacity();
			this.opacity = opacity * parent.opacity;
		}else{
			this.opacity = opacity;
		}
	}
}
