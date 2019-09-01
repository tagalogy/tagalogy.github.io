import EventTarget from "./event.js";
import {
	sine,
	alphaToRange,
	now
} from "./easing.js";
import Scene from "./scene.js";
import timeout from "./timeout.js";
export default class Object2D extends EventTarget{
	constructor(option) {
		super();
		this.boundAnimID = -1;
		this.opacityAnimID = -1;
		this.visible = true;
		this.children = [];
		this.parent = null;
		this.scene = null;
		this._z = 0;
		let {
			parent
		} = option;
		if(parent) this.addTo(parent);
		this.setOpacity(option);
		this.setBound(option);
	}
	/*
	Opacity Properties
	*/
	get opacity() {
		return this.getOpacity();
	}
	set opacity(opacity) {
		return this.setOpacity(opacity);
	}
	/*
	Z Properties
	*/
	get z() {
		return this._z;
	}
	set z(num) {
		this._z = num;
		this.parent.updateDrawOrder();
	}
	/*
	Bound Setting and Animating Methods
	*/
	setBound(option) {
		this.getBound = getBoundWrapper(option);
	}
	animateBound(option, time, easing) {
		return this.animateGetBound(getBoundWrapper(option), time, easing);
	}
	animateGetBound(getBound, time = 400, easing = sine) {
		clearTimeout(this.boundAnimID);
		let oldGetBound = this.getBound;
		let startTime = now();
		this.getBound = function() {
			let alpha = easing((now() - startTime) / time);
			let oldBound = oldGetBound.call(this);
			let newBound = getBound.call(this);
			return {
				x: alphaToRange(alpha, oldBound.x, newBound.x),
				y: alphaToRange(alpha, oldBound.y, newBound.y),
				width: alphaToRange(alpha, oldBound.width, newBound.width),
				height: alphaToRange(alpha, oldBound.height, newBound.height)
			};
		};
		this.boundAnimID = setTimeout(() => {
			this.getBound = getBound;
		}, time);
		return timeout(time);
	}
	/*
	Opacity Setting and Animating Methods
	*/
	setOpacity(option) {
		this.getOpacity = getOpacityWrapper(option);
	}
	animateOpacity(option, time, easing) {
		return this.animateGetOpacity(getOpacityWrapper(option), time, easing);
	}
	animateGetOpacity(getOpacity, time = 400, easing = sine) {
		clearTimeout(time);
		let oldGetOpacity = this.getOpacity;
		let startTime = now();
		this.getOpacity = function() {
			let alpha = easing((now() - startTime) / time);
			let oldOpacity = oldGetOpacity.call(this);
			let newOpacity = getOpacity.call(this);
			return alphaToRange(alpha, oldOpacity, newOpacity);
		};
		this.opacityAnimID = setTimeout(() => {
			this.getOpacity = getOpacity;
		}, time)
		return timeout(time);
	}
	/*
	Shortcut Opacity Animation Methods
	*/
	fadeIn(time, easing) {
		this.visible = true;
		return animateOpacity(1, time, easing);
	}
	fadeOut(time, easingback) {
		return animateOpacity(0, time, easing).then(() => void (this.visible = false));
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
		context.globalOpacity = this.getOpacity();
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
		child.remove(false);
		child.parent = this;
		child.setscene(this.scene);
		this.children.push(child);
		if(updateDrawOrder) this.updateDrawOrder();
	}
	addChildren(children, updateDrawOrder = true) {
		for(let child of children) this.addChild(child, false);
		if(updateDrawOrder) this.updateDrawOrder();
	}
	addTo(parent, updateDrawOrder) {
		parent.addChild(this, updateDrawOrder);
	}
	removeChild(child, setscene = true) {
		if(child.parent == this) {
			child.parent = null;
			if(setscene) child.setscene(null);
			let {children} = this;
			children.splice(children.indexOf(child), 1);
		}
	}
	remove(setscene = true) {
		let {parent} = this;
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
		let {
			x,
			y,
			width,
			height
		} = this.getBound();
		return testX > x && testY > y && testX < x + width && testY < y + height;
	}
}
export function getBoundWrapper(option) {
	let {
		getBound
	} = option;
	if(getBound) return getBound;
	let {
		copyBound
	} = option;
	if(copyBound) return function() {
		return copyBound.getBound();
	}
	let {
		x = 0,
		y = 0,
		width = 0,
		height = 0,
		isPositionRelative = true,
		isScaleRelative = false
	} = option;
	return function() {
		let {parent} = this;
		let offsetX;
		let offsetY;
		let offsetWidth;
		let offsetHeight;
		if(parent) {
			let offsetBound = parent.getBound();
			offsetX = isPositionRelative ? offsetBound.x : 0;
			offsetY = isPositionRelative ? offsetBound.y : 0;
			offsetWidth = isScaleRelative ? offsetBound.width : 1;
			offsetHeight = isScaleRelative ? offsetBound.height : 1;
		}else{
			offsetX = 0;
			offsetY = 0;
			offsetWidth = 1;
			offsetHeight = 1;
		}
		return {
			x: offsetX + offsetWidth * x,
			y: offsetY + offsetHeight * y,
			width: offsetWidth * width,
			height: offsetHeight * height
		};
	};
}
export function getOpacityWrapper(option) {
	if(typeof option == "number")  {
		return function() {
			return option;
		};
	}
	let {
		getOpacity
	} = option;
	if(getOpacity) return getOpacity;
	let {
		copyOpacity
	} = option;
	if(copyOpacity) return function() {
		return copyOpacity.getOpacity();
	}
	let {
		opacity = 1,
		isOpacityRelative = true
	} = option;
	return function() {
		let {parent} = this;
		if(! (parent && isOpacityRelative)) return opacity;
		return opacity * parent.getOpacity();
	}
}
