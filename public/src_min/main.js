var main = (function (exports) {
	'use strict';

	class EventTarget{
		constructor(option = {}) {
			this.listeners = new Map();
			for(let name in option) if(name.substring(0, 2) == "on") this.on(name.substring(2), option[name]);
		}
		getHandler(name) {
			let listeners = this.listeners;
			let handlers = listeners.get(name);
			if(! handlers) listeners.set(name, handlers = []);
			return handlers;
		}
		on(name, handler) {
			let handlers = this.getHandler(name);
			handlers.push(handler);
		}
		once(name, handler) {
			return new Promise((resolve, reject) => {
				let sub = () => {
					this.off(name, sub);
					if(handler) handler();
					resolve();
				};
				this.on(name, sub);
			});
		}
		off(name, handler) {
			let handlers = this.getHandler(name);
			let index = handlers.indexOf(handler);
			if(index >= 0) handlers.splice(index, 1);
		}
		invoke(name) {
			let handlers = this.getHandler(name);
			for(let handler of handlers) handler.call(this);
		}
	}
	//TODO: bubbling and propagation cancellation

	let sin = Math.sin;
	const PI = Math.PI;
	function wrapper(func) {
		return num => {
			if(num <= 0) return 0;
			if(num >= 1) return 1;
			return func(num);
		};
	}
	let linear = wrapper(x => x);
	let sine = wrapper(x => (sin((x - 1 / 2) * PI) + 1) / 2);
	let sineIn = wrapper(x => sin((x - 1) * PI / 2) + 1);
	let sineOut = wrapper(x => sin(x * PI / 2));
	let expoOut = wrapper(x => - (2 ** (x * -10)) + 1);
	function alphaToRange(alpha, min, max) {
		return alpha * (max - min) + min;
	}
	function now() {
		return + new Date;
	}

	function timeout(delay) {
		return new Promise(resolve => {
			setTimeout(() => {
				resolve(delay);
			}, delay);
		});
	}
	function now$1() {
		return + new Date;
	}

	class Object2D extends EventTarget{
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
		fadeIn(time, easing) {
			this.visible = true;
			return animateOpacity(1, time, easing);
		}
		fadeOut(time, easingback) {
			return animateOpacity(0, time, easing).then(() => {
				this.visible = false;
			});
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
	function updateBoundWrapper(option) {
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
	function updateOpacityWrapper(option) {
		if(typeof option == "number")  {
			option = {
				opacity: option
			};
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

	class Frame{
		constructor(onframe) {
			this.playing = true;
			let callback = () => {
				if(! this.playing) return;
				onframe();
				requestAnimationFrame(callback);
			}; 
			requestAnimationFrame(callback);
		}
		stop() {
			this.playing = false;
		}
	}

	class Color{
		constructor(option = {}) {
			this.colorAnimID = -1;
			this.setColor(option);
		}
		getString() {
			this.updateColor();
			let {
				red,
				green,
				blue,
				alpha
			} = this;
			return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
		}
		toString() {
			return this.getString();
		}
		setColor(option) {
			this.updateColor = updateColorWrapper(option);
		}
		animateColor(option, time, easing) {
			return this.animateUpdateColor(updateColorWrapper(option), time, easing);
		}
		animateUpdateColor(updateColor, time = 400, easing = sine) {
			clearTimeout(this.colorAnimID);
			let oldUpdateColor = this.updateColor;
			let startTime = now();
			this.updateColor = function() {
				let alpha = easing((now() - startTime) / time);
				oldUpdateColor.call(this);
				let {
					red: oldRed,
					green: oldGreen,
					blue: oldBlue,
					alpha: oldAlpha
				} = this;
				updateColor.call(this);
				let {
					red: newRed,
					green: newGreen,
					blue: newBlue,
					alpha: newAlpha
				} = this;
				this.red = alphaToRange(alpha, oldRed, newRed);
				this.green = alphaToRange(alpha, oldGreen, newGreen);
				this.blue = alphaToRange(alpha, oldBlue, newBlue);
				this.alpha = alphaToRange(alpha, oldAlpha, newAlpha);
			};
			this.colorAnimID = setTimeout(() => {
				this.updateColor = updateColor;
			}, time);
			return timeout(time);
		}
	}
	function updateColorWrapper(option) {
		if(typeof option == "string") {
			option = option.trim();
			if(option[0] == "#") {
				let rawString = option.substr(1);
				let raw = parseInt(rawString, 16);
				let red, green, blue, alpha;
				switch(rawString.length) {
					case 3:
						red = ((raw >> 2 * 4) & 0xf) * 0x11;
						green = ((raw >> 1 * 4) & 0xf) * 0x11;
						blue = ((raw >> 0 * 4) & 0xf) * 0x11;
						alpha = 1;
						break;
					case 4:
						red = ((raw >> 3 * 4) & 0xf) * 0x11;
						green = ((raw >> 2 * 4) & 0xf) * 0x11;
						blue = ((raw >> 1 * 4) & 0xf) * 0x11;
						alpha = ((raw >> 0 * 4) & 0xf) / 0xf;
						break;
					case 6:
						red = (raw >> 4 * 4) & 0xff;
						green = (raw >> 2 * 4) & 0xff;
						blue = (raw >> 0 * 4) & 0xff;
						alpha = 1;
						break;
					case 8:
						red = (raw >> 6 * 4) & 0xff;
						green = (raw >> 4 * 4) & 0xff;
						blue = (raw >> 2 * 4) & 0xff;
						alpha = ((raw >> 0 * 4) & 0xff) / 0xff;
						break;
				}
				return function() {
					this.red = red;
					this.green = green;
					this.blue = blue;
					this.alpha = alpha;
				}
			}
		}
		let {
			updateColor
		} = option;
		if(updateColor) return updateColor;
		let {
			red = 255,
			green = 255,
			blue = 255,
			alpha = 1
		} = option;
		return function() {
			this.red = red;
			this.green = green;
			this.blue = blue;
			this.alpha = alpha;
		}
	}

	class Scene extends Object2D {
		constructor(option = {}) {
			super(option);
			this.scene = this;
			let {
				canvas,
				alpha = true,
				scale = 1
			} = option;
			this.scale = scale;
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
				height,
			} = this;
			canvas.width = width;
			canvas.height = height;
			context.clearRect(0, 0, width, height);
			if(drawChildren) this.drawChildren(context);
		}
	}

	let min = Math.min;
	class SafeArea extends Object2D {
		constructor(option = {}) {
			super(option);
			let {
				ratio
			} = option;
			this.updateBound = function() {
				let {
					parent
				} = this;
				//parent.updateBound();
				let {
					x,
					y,
					width,
					height
				} = parent;
				let scale = min(width / ratio, height);
				let finalWidth = scale * ratio;
				this.x = x + (width - finalWidth) / 2;
				this.y = y + (height - scale) / 2;
				this.width = finalWidth;
				this.height = scale;
			};
		}
	}

	const TRANSPARENT_OPTION = "#0000";
	class Base extends Object2D {
		constructor(option = {}) {
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
	function updateThicknessWrapper(option) {
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

	class Rectangle extends Base {
		draw(context, drawChildren = true) {
			if(! this.visible) return;
			super.draw(context, false);
			this.updateBound();
			let {
				x,
				y,
				width,
				height
			} = this;
			context.fillRect(x, y, width, height);
			context.strokeRect(x, y, width, height);
			if(drawChildren) this.drawChildren(context);
		}
	}

	function loadImage(src, alt = "") {
		return new Promise((resolve, reject) => {
			let image = new Image;
			image.src = src;
			image.alt = alt;
			image.addEventListener("load", function() {
				resolve(image);
			});
			image.addEventListener("error", function() {
				reject(`Unable to load ${alt} from ${src}`);
			});
		});
	}
	function loadImages(srcs) {
		return Promise.all(srcs.map(src => loadImage(src)));
	}

	let images = {};
	let assets = loadImages([
		"./asset/title.png",
	]);
	assets.then(rawImages => {
		images.TITLE_PNG = rawImages[0];
	});
	let colors = {
		TRANSPARENT: new Color("#0000"),
		WHITE: new Color("#fff"),
		BLACK: new Color("#000"),
		PH_BLUE: new Color("#0038a8"),
		SKY_BLUE: new Color("#0f5fff"),
		PH_RED: new Color("#ce1126"),
		PH_YELLOW: new Color("#fdc116"),
	};

	let min$1 = Math.min;
	class RoundedRectangle extends Base{
		constructor(option = {}) {
			super(option);
			this.setRadius(option);
		}
		setRadius(option) {
			this.updateRadius = updateRadiusWrapper(option);
		}
		draw(context, drawChildren = true) {
			if(! this.visible) return;
			super.draw(context, false);
			this.updateBound();
			this.updateRadius();
			let {
				radius,
				x: minX,
				y: minY,
				width,
				height
			} = this;
			let midX = minX + width / 2;
			let midY = minY + height / 2;
			let maxX = minX + width;
			let maxY = minY + height;
			context.beginPath();
			context.moveTo(midX, minY);
			context.arcTo(maxX, minY, maxX, midY, radius);
			context.lineTo(maxX, midY);
			context.arcTo(maxX, maxY, midX, maxY, radius);
			context.lineTo(midX, maxY);
			context.arcTo(minX, maxY, minX, midY, radius);
			context.lineTo(minX, midY);
			context.arcTo(minX, minY, midX, minY, radius);
			context.closePath();
			context.fill();
			context.stroke();
			if(drawChildren) this.drawChildren(context);
		}
	}
	function updateRadiusWrapper(option) {
		if(typeof option == "number")  {
			return function() {
				return option;
			};
		}
		let {updateRadius} = option;
		if(updateRadius) return updateRadius;
		let {
			radius = 0,
			isRadiusRelative = true
		} = option;
		return function() {
			if(isRadiusRelative) {
				let {
					width,
					height
				} = this;
				this.radius = min$1(width, height) * radius;
			}else{
				this.radius = radius;
			}
		}
	}

	class Text extends Object2D{
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
	function updateSizeWrapper(option) {
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
	const NEWLINES = /\r\n|\r|\n/;
	const SPACES = /\s+/;
	function getLines(context, text, maxWidth) {
		let lines = [];
		for(let paragraph of text.trim().split(NEWLINES)) {
			let words = paragraph.trim().split(SPACES);
			let currentLine = words[0];
			for (let i = 1; i < words.length; i++) {
				let word = words[i];
				let currentWord = `${ currentLine } ${ word }`;
				let width = context.measureText(currentWord).width;
				if (width < maxWidth) {
					currentLine = currentWord;
				} else {
					lines.push(currentLine);
					currentLine = word;
				}
			}
			lines.push(currentLine);
		}
		return lines;
	}

	let min$2 = Math.min;
	class Image$1 extends Object2D{
		constructor(option = {}) {
			super(option);
			this.source = option.source;
			let {
				imageScaling = "fit"
			} = option;
			this.imageScaling = imageScaling;
		}
		draw(context, drawChildren = true) {
			if(! this.visible) return;
			super.draw(context, false);
			this.updateBound();
			let {
				source,
				imageScaling
			} = this;
			let {
				naturalWidth: rawSrcWidth,
				naturalHeight: rawSrcHeight
			} = source;
			let {
				x,
				y,
				width: rawDestWidth,
				height: rawDestHeight
			} = this;
			if(imageScaling == "fit") {
				let scaleX = rawDestWidth / rawSrcWidth;
				let scaleY = rawDestHeight / rawSrcHeight;
				let scale = min$2(scaleX, scaleY);
				let width = scale * rawSrcWidth;
				let height = scale * rawSrcHeight;
				context.drawImage(source, x + (rawDestWidth - width) / 2, y + (rawDestHeight - height) / 2, width, height);
			}
			if(drawChildren) this.drawChildren(context);
		}
	}

	class FreeForm extends Base {
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

	class Line extends Base {
		constructor(option = {}) {
			super(option);
			this.coordsAnimID = -1;
			this.setCoords(option);
		}
		setCoords(option) {
			this.updateCoords = updateCoordsWrapper(option);
		}
		animateCoords(option, time, easing) {
			return this.animateUpdateCoords(getCoordsWrapper(option), time, easing);
		}
		animateUpdateCoords(updateCoords, time = 400, easing = SINE) {
			clearTimeout(this.coordsAnimID);
			let oldUpdateCoords = this.updateCoords;
			let startTime = now();
			this.updateCoords = function() {
				let alpha = easing((now() - startTime) / time);
				oldUpdateCoords.call(this);
				let {
					x0: oldX0,
					y0: oldY0,
					x1: oldX1,
					y1: oldY1
				} = this;
				updateCoords.call(this);
				let {
					x0: newX0,
					y0: newY0,
					x1: newX1,
					y1: newY1
				} = this;
				return {
					x0: alphaToRange(alpha, oldX0, newX0),
					y0: alphaToRange(alpha, oldY0, newY0),
					x1: alphaToRange(alpha, oldX1, newX1),
					y1: alphaToRange(alpha, oldY1, newY1)
				};
			};
			this.coordsAnimID = setTimeout(() => {
				this.updateCoords = updateCoords;
			}, time);
			return new timeout(time);
		}
		draw(context, drawChildren = true) {
			if(! this.visible) return;
			super.draw(context, false);
			this.updateCoords();
			let {
				x0,
				y0,
				x1,
				y1
			} = this;
			context.beginPath();
			context.moveTo(x0, y0);
			context.lineTo(x1, y1);
			context.stroke();
			if(drawChildren) this.drawChildren(context);
		}
	}
	function updateCoordsWrapper(option) {
		let {updateCoords} = option;
		if(updateCoords) return updateCoords;
		let {
			x0 = 0,
			y0 = 0,
			x1 = 0,
			y1 = 0
		} = option;
		return function() {
			this.updateBound();
			let {
				x,
				y,
				width,
				height
			} = this;
			this.x0 = x + width * x0;
			this.y0 = y + height * y0;
			this.x1 = x + width * x1;
			this.y1 = y + height * y1;
		};
	}

	class Horizontal extends Line {
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

	class GameState extends EventTarget{
	    constructor(option = {}) {
	        super(option);
	        this.stopped = false;
	        this.paused = false;
	        this.startTime = now();
	        this.pauseStartTime = NaN;
	        this.pauseTime = 0;
	        this.timeWhenPaused = 0;
	    }
	    get time() {
	        if(this.paused) return this.timeWhenPaused;
	        return now() - this.startTime - this.pauseTime;
	    }
	    pause() {
	        if(this.paused) return;
	        this.timeWhenPaused = this.time;
	        this.pauseStartTime = now();
	        this.paused = true;
	        this.invoke("pause");
	    }
	    play() {
	        if(this.stopped || ! this.paused) return;
	        this.pauseTime += now() - this.pauseStartTime;
	        this.paused = false;
	        this.invoke("play");
	    }
	    toggle() {
	        if(this.paused) {
	            this.play();
	        }else{
	            this.pause();
	        }
	    }
	    stop() {
	        this.pause();
	        this.stopped = true;
	        this.invoke("stop");
	    }
	    timeout(time) {
	        return new Promise((resolve, reject) => {
	            let id = -1;
	            let timeStart = this.time;
	            let timeLeft = time;
	            let onplay = () => {
	                id = setTimeout(() => {
	                    this.off("play", onplay);
	                    this.off("pause", onpause);
	                    resolve();
	                }, timeLeft);
	            };
	            let onpause = () => {
	                timeLeft -= this.time - timeStart;
	                timeStart = this.time;
	                clearTimeout(id);
	            };
	            if(! this.paused) onplay();
	            this.on("play", onplay);
	            this.on("pause", onpause);
	            this.once("stop", () => {
	                reject();
	            });
	        });
	    }
	}

	let dialogBox, msgBox, cancelBox, okBox, cancelText, okText;
	let cancelFill = new Color(colors.WHITE);
	let cancelColor = new Color(colors.BLACK);
	let okFill = new Color(colors.PH_BLUE);
	let okColor = new Color(colors.WHITE);
	let dialog = new Rectangle({
	    x: 0,
	    y: 0,
	    width: 1,
	    height: 1,
	    fill: colors.BLACK,
	    child: new SafeArea({
	        ratio: 3 / 5,
	        isOpacityRelative: false,
	        opacity: 1,
	        child: dialogBox = new RoundedRectangle({
	            fill: colors.WHITE,
	            radius: 1 / 16,
	            children: [
	                msgBox = new Text({
	                    x: 1 / 8,
	                    y: 0 / 8,
	                    width: 6 / 8,
	                    height: 6 / 8,
	                    wrap: true,
	                    align: "left",
	                    baseline: "middle",
	                    font: "ComicNueue Angular",
	                    size: 1 / 9,
	            		color: colors.BLACK
	                }),
	                new Object2D({
	                    x: 0 / 8,
	                    y: 6 / 8,
	                    width: 8 / 8,
	                    height: 2 / 8,
	                    children: [
	                        cancelBox = new RoundedRectangle({
	                            x: 0,
	                            y: 0,
	                            width: 1 / 2,
	                            height: 1,
	                            radius: 1 / 4,
	                            fill: cancelFill,
	                            child: cancelText = new Text({
	                                x: 0,
	                                y: 0,
	                                width: 1,
	                                height: 1,
	                                size: 4 / 10,
	                                color: cancelColor,
	                                font: "ComicNueue Angular",
	                                weight: "bold"
	                            }),
	                            oninteractdown() {
	                                cancelFill.setColor(colors.PH_RED);
	                                cancelColor.setColor(colors.WHITE);
	                            },
	                            oninteractup() {
	                                cancelFill.setColor(colors.WHITE);
	                                cancelColor.setColor(colors.BLACK);
	                            }
	                        }),
	                        okBox = new RoundedRectangle({
	                            x: 1 / 2,
	                            y: 0,
	                            width: 1 / 2,
	                            height: 1,
	                            radius: 1 / 4,
	                            fill: okFill,
	                            child: okText = new Text({
	                                x: 0,
	                                y: 0,
	                                width: 1,
	                                height: 1,
	                                size: 4 / 10,
	                                color: okColor,
	                                font: "ComicNueue Angular",
	                                weight: "bold"
	                            }),
	                            oninteractdown() {
	                                okFill.setColor(colors.WHITE);
	                                okColor.setColor(colors.BLACK);
	                            },
	                            oninteractup() {
	                                okFill.setColor(colors.PH_BLUE);
	                                okColor.setColor(colors.WHITE);
	                            }
	                        })
	                    ]
	                })
	            ]
	        })
	    })
	});
	async function popup(msg, ok, cancel) {
	    dialog.addTo(scene);
	    dialog.setOpacity(0);
	    dialog.animateOpacity(1 / 2, 400);
	    dialogBox.setBound({
	        x: 1 / 6,
	        y: 10 / 10,
	        width: 4 / 6,
	        height: 4 / 10,
	    });
	    dialogBox.animateBound({
	        x: 1 / 6,
	        y: 3 / 10,
	        width: 4 / 6,
	        height: 4 / 10,
	    }, 400, expoOut);
	    msgBox.content = msg;
	    okText.content = ok;
	    cancelText.content = cancel;
	    let value = await Promise.race([
	        overridePromise(okBox.once("interactup"), true),
	        overridePromise(cancelBox.once("interactup"), false)
	    ]);
	    dialog.animateOpacity(0, 200);
	    dialogBox.animateBound({
	        x: 1 / 6,
	        y: 10 / 10,
	        width: 4 / 6,
	        height: 4 / 10,
	    }, 200, sineIn);
	    await timeout(200);
	    dialog.remove();
	    return value;
	}
	async function overridePromise(promise, value) {
	    await promise;
	    return value;
	}

	let pauseBox = new Rectangle({
	    x: 0,
	    y: 0,
	    width: 1,
	    height: 1,
	    fill: colors.WHITE,
	    child: new SafeArea({
	    	ratio: 3 / 5,
	        child: new Text({
	            x: 0 / 6,
	            y: 4 / 10,
	            width: 6 / 6,
	            height: 2 / 10,
	            font: "ComicNueue Angular",
	            weight: "bold",
	            size: 5 / 10,
	            content: "nakahinto",
	            color: colors.BLACK
	        }),
	    })
	});
	async function start() {
	    pauseBox.addTo(scene);
	    pauseBox.setOpacity(0);
	    await pauseBox.animateOpacity(1, 200);
	    await pauseBox.once("interactup");
	    await pauseBox.animateOpacity(0, 200);
	    pauseBox.remove();
	}

	const SPANISH = [
	    "Abante",
		"Abelyana",
		"Abiso",
		"Ahedres",
		"Ahente",
		"Alemanya",
		"Amarilyo",
		"Antena",
		"Aparador",
		"Asoge",
		"Asul",
		"Asupre",
		"Atenas",
		"Baryo",
		"Baso",
		"Basura",
		"Bentilador",
		"Bisagra",
		"Bisikleta",
		"Bruha",
		"Bulsa",
		"Busina",
		"Britanya",
		"Datos",
		"Departamento",
		"Dinero",
		"Deskaril",
		"Diyos",
		"Duwende",
		"Diyaryo",
		"Ebanghelyo",
		"Edad",
		"Ekolohiya",
		"Ekonomiya",
		"Ekwador",
		"Elyo",
		"Embahada",
		"Embahador",
		"Ensalada",
		"Eroplano",
		"Espada",
		"Espanyol",
	    "Español",
		"Espongha",
		"Estados",
		"Estadistika",
		"Estupido",
		"Garahe",
		"Gasolina",
		"Gastos",
		"Gitara",
		"Gobyerno",
		"Guwapo",
		"Giyera",
		"Hapon",
		"Hapones",
		"Hardin",
		"Hardinero",
		"Hepe",
		"Heringgilya",
		"Huwes",
		"Idroheno",
		"Industriya",
		"Ingles",
		"Inglatera",
		"Intindi",
		"Kalabasa",
		"Kaloriya",
		"Kamelyo",
		"Kampeon",
		"Kandidato",
		"Kapasidad",
		"Kapilya",
		"Keso",
		"Kloro",
		"Kobalto",
		"Kolehiyo",
		"Kolesterol",
		"Konstitusyon",
		"Kontrabando",
		"Konsepto",
		"Kordero",
		"Korte",
		"Kotse",
	    "Awto",
		"Kumusta",
		"Kuweba",
		"Kuwenta",
		"Lapis",
		"Libra",
		"Lingguwistika",
		"Loko",
		"Lugar",
		"Luho",
		"Maleta",
		"Mani",
		"Mantika",
		"Mantsa",
		"Margarina",
		"Matematika",
		"Matematiko",
		"Memorya",
		"Militar",
		"Minuto",
		"Miyembro",
		"Monarkiya",
		"Motorsiklo",
		"Musika",
		"Mustasa",
		"Nasyonalista",
		"Obispo",
		"Oksiheno",
		"Olanda",
		"Onsa",
		"Opisyal",
		"Otel",
		"Pabrika",
		"Pamilya",
		"Panderetas",
		"Pantalon",
		"Papel",
		"Parol",
		"Parke",
		"Pasaporte",
		"Payaso",
		"Pelikula",
		"Pilduras",
		"Pilipinas",
		"Piso",
		"Porke",
		"Probinsiya",
		"Presidente",
		"Presko",
		"Protina",
		"Pulgada",
		"Pulisya",
		"Puwede",
		"Puwera",
		"Radyo",
		"Realidad",
		"Relo",
		"Republika",
		"Sabadista",
		"Sapatos",
		"Sardinas",
		"Sarado",
		"Selyo",
		"Sentimyento",
		"Senyales",
		"Sikolohiya",
		"Sim",
		"Simple",
		"Sipilyo",
		"Siyudad",
		"Sundalo",
		"Sustansya",
		"Sustento",
		"Suweldo",
		"Tableta",
		"Tangke",
		"Tarheta",
		"Tasa",
		"Teklado",
		"Tela",
		"Telebisyon",
		"Telepono",
		"Tiya",
		"Tiyo",
		"Tsino",
		"Tsinelas",
		"Tisa",
		"Tsismis",
		"Tumbaga",
		"Unibersidad",
		"Welga",
		"Yelo",
		"Yodo"
	];
	const LATIN = [
	    "Agila",
		"Ahensiya",
		"Ambisyoso",
		"Andar",
		"Arina",
		"Arko",
		"Armas",
		"Asno",
		"Baka",
		"Bakasyon",
		"Barko",
		"Basura",
		"Berde",
		"Bulkan",
		"Diperensiya",
		"Direktor",
		"Diyos",
		"Ebanghelyo",
		"Edad",
		"Edukasyon",
		"Ehersisyo",
		"Espanya",
		"Estudyante",
		"Puwersa",
		"Hustisya",
		"Impluwensiya",
		"Impiyerno",
		"Inutil",
		"Kabalyero",
		"Kabayo",
		"Kalbo",
		"Kampana",
		"Kandila",
		"Karne",
		"Kasal",
		"Keso",
		"Kutis",
		"Kuwadrado",
		"Labi",
		"Lengguwahe",
		"Libro",
		"Mansanas",
		"Merkado",
		"Mundo",
		"Multa",
		"Museo",
		"Negosyo",
		"Numero",
		"Oras",
		"Ordinaryo",
		"Ospital",
		"Padre",
	    "Pari",
		"Peligro",
		"Pista",
	    "Piyesta",
		"Reyna",
		"Sabon",
		"Sebo",
		"Selebrasyon",
		"Sementeryo",
		"Serbesa",
		"Sereso",
		"Saserdote",
		"Silya",
		"Simbolo",
		"Sinturon",
		"Siyensiya",
		"Suwerte",
		"Transportasyon",
		"Triyanggulo",
		"Trigo",
		"Ubas",
		"Unibersidad",
		"Yero"
	];
	const GREEK = [
	    "Angkla",
		"Anghel",
		"Balyena",
		"Bibliya",
		"Bibliyoteka",
		"Biyolohiya",
		"Bodega",
		"Katoliko",
		"Kristo",
		"Kristiyano",
		"Eksena",
		"Eskuwela",
		"Obispo",
		"Makina",
		"Parokya",
		"Selos",
		"Teknolohiya"
	];
	const DRICK = [
		"usbaw",
		"sagak",
		"saging",
		"rambutan",
		"lansones",
		"santol",
		"bayabas",
		"kamiyas",
		"kamatis",
		"luya",
		"sayote",
		"papaya",
		"sili",
		"manok",
		"tinola",
		"sibuyas",
		"bawang",
		"baboy",
		"toyo",
		"suka",
		"patatas",
		"adobo",
		"malunggay",
		"saba",
		"mamay",
		"lakatan",
		"tokwa",
		"tokneneng",
		"lomi",
		"marupok",
		"putok",
		"tulog",
		"gising",
		"puyat",
		"antok",
		"sabog",
		"droga",
		"otdo",
		"dayami",
		"hiso",
		"sinsay",
		"singkamas",
		"bumulusok",
		"bagsik",
		"lumubog",
		"tumalyang",
		"iniwan",
		"sinaktan",
		"luhaan",
		"pinaltan",
		"binalikan",
		"patawad",
		"kalampag",
		"tumirik",
		"lagabag",
		"palapag",
		"kinuyog",
		"pinaslang",
		"sinuyod",
		"bilad",
		"tinuhog",
		"baliko",
		"tumarak",
		"masarap",
		"tinira",
		"tinikman",
		"tingkayad",
		"hinimod",
		"dumila",
		"paalam",
		"simoy",
		"sumirok",
		"lumansag",
		"abante",
		"bulgar",
		"sumayad",
		"sumayaw",
		"baliw",
		"ulyanin",
		"damdamin",
		"komedya",
		"tulyasi",
		"ginisa",
		"kaldero",
		"malinamnam",
		"salumpuwet",
		"pagaspas",
		"malinaw",
		"papaitan",
		"menudo",
		"apdo",
		"atay",
		"balunbalunan",
		"bentilador",
		"tirador",
		"Kuntador",
		"kandado",
		"swelas",
		"Salwal",
		"salisi",
		"pasador",
		"pulgada",
		"kargada",
		"kargador",
		"tukador",
		"sapin",
		"lampin",
		"pundiyo",
		"manggas",
		"bangon",
		"baligwas",
		"bagwis",
		"palong",
		"tropeyo",
		"medalya",
		"walis",
		"pagsubok",
		"pagsubo",
		"pagsuko",
		"hasang",
		"kaliskis",
		"mabangis",
		"bungisngis",
		"bungal",
	];
	const TAMBALAN = [
		"bahag-hari",
		"urong-sulong",
		"bungang-araw",
		"hating-gabi",
		"agaw-pansin",
		"sawing-palad"
	];
	const WORD = [...SPANISH, ...LATIN, ...GREEK, ...DRICK, ...TAMBALAN].map(str => str.toUpperCase());
	console.log(`Word Count: ${WORD.length}`);

	let blanko = /\s+/;
	let mga_unahang_katinig = `
    b  c  d  f  g  h  j  k  l  m  n  p  ñ  ng  q  r  s  t  v  w  x  y  z
       ch                                            sh
    bl cl dl fl gl       kl          pl                 tl vl
    br cr dr fr gr       kr          pr                 tr vr
                                                        ts
`.toUpperCase().trim().split(blanko);
	mga_unahang_katinig.push("");
	let pang_unahan_at_hulihan = /^[BCDFGHJKLMNÑPQRSTVWXYZ]*|[BCDFGHJKLMNÑPQRSTVWXYZ]*$/g;
	let pangkatinig_lahat = /^[BCDFGHJKLMNÑPQRSTVWXYZ]*$/;
	let panggrupo = /[BCDFGHJKLMNÑPQRSTVWXYZ]+|[AEIOU]/g;
	let pangpatinig = /[AEIOU]/;
	let panggrupong_may_gitling = /[^\-]+|\-+/g;
	function parseSingleWord(salita) {
	    salita = salita.toUpperCase();
	    if(pangkatinig_lahat.test(salita)) return [
	        salita
	    ];
	    let [
	        unahang_katinig,
	        hulihang_katinig
	    ] = salita.match(pang_unahan_at_hulihan);
	    let kasalukuyang_katinig = unahang_katinig;
	    let mga_pantig = [];
	    for(let grupo of salita.replace(pang_unahan_at_hulihan, "").match(panggrupo)) {
	        if(pangpatinig.test(grupo)) {
	            mga_pantig.push(kasalukuyang_katinig + grupo);
	            kasalukuyang_katinig = "";
	        }else{
	            for(let pang_ilan = 0, sukat = grupo.length; pang_ilan <= sukat; pang_ilan ++) {
	                let kasalukuyang_hulihang_katinig = grupo.substring(0, pang_ilan);
	                let kasalukuyang_unahang_katinig = grupo.substring(pang_ilan);
	                if(mga_unahang_katinig.indexOf(kasalukuyang_unahang_katinig) >= 0) {
	                    mga_pantig[mga_pantig.length - 1] += kasalukuyang_hulihang_katinig;
	                    kasalukuyang_katinig = kasalukuyang_unahang_katinig;
	                    break;
	                }
	            }
	        }
	    }
	    mga_pantig[mga_pantig.length - 1] += hulihang_katinig;
	    return mga_pantig;
	}
	function parseWord(salita) {
	    let re = [];
	    for(let grupo of salita.match(panggrupong_may_gitling)) {
	        if(grupo == "-") {
	            re.push("-");
	        }else{
	            for(let pantig of parseSingleWord(grupo)) re.push(pantig);
	        }
	    }
	    return re;
	}

	let wordLen = WORD.length;
	let inputBox = new Text({
	    font: "ComicNueue Angular",
	    weight: "bold",
	    size: 5 / 10
	});
	let buttonBox = new Object2D;
	let prevHandler;
	async function start$1() {
	    if(prevHandler) inputBox.off("interactup", prevHandler);
	    inputBox.content = "";
	    inputBox.addTo(game);
	    inputBox.setBound({
	        x: 1,
	        y: 0,
	        width: 3 / 3,
	        height: 1 / 4
	    });
	    inputBox.animateBound({
	        x: 0,
	        y: 0,
	        width: 3 / 3,
	        height: 1 / 4
	    }, 400, expoOut);
	    buttonBox.addTo(game);
	    buttonBox.setBound({
	        x: 1,
	        y: 1 / 4,
	        width: 3 / 3,
	        height: 3 / 4
	    });
	    buttonBox.animateBound({
	        x: 0,
	        y: 1 / 4,
	        width: 3 / 3,
	        height: 3 / 4
	    }, 400, expoOut);
	    let input = [];
	    let correct = WORD[Math.floor(Math.random() * wordLen)];
	    let word = parseWord(correct);
	    word.sort(() => Math.random() - Math.random());
	    let currentLen = word.length;
	    word.forEach((syllable, ind) => {
	        syllable = syllable.toLowerCase();
	        let lineColor = new Color(colors.TRANSPARENT);
	        let fillColor = new Color(colors.PH_BLUE);
	        let textColor = new Color(colors.WHITE);
	        let currentPlace = new Object2D({
	            x: 0,
	            y: (4 - ind)/ 5,
	            width: 1,
	            height: 1 / 5,
	            child: new RoundedRectangle({
	                x: 1 / 8,
	                y: 1 / 8,
	                width: 6 / 8,
	                height: 6 / 8,
	                dash: [2, 2],
	                dashSpeed: 4 / 1000,
	                fill: fillColor,
	                line: lineColor,
	                updateThickness,
	                radius: 1 / 2,
	                child: new Text({
	                    x: 0,
	                    y: 0,
	                    width: 1,
	                    height: 1,
	                    font: "ComicNueue Angular",
	                    weight: "bold",
	                    color: textColor,
	                    size: 6 / 10,
	                    content: syllable,
	                })
	            }),
	            oninteractup() {
	                if(gameState.paused) return;
	                if(this.pressed) {
	                    this.unpress();
	                    input.splice(input.lastIndexOf(this.content), 1);
	                    inputBox.content = input.join("");
	                }else{
	                    this.pressed = true;
	                    input.push(this.content);
	                    inputBox.content += this.content;
	                    lineColor.setColor(colors.PH_BLUE);
	                    fillColor.setColor(colors.WHITE);
	                    textColor.setColor(colors.PH_BLUE);
	                    if(input.length >= currentLen && WORD.indexOf(input.join("").toUpperCase()) >= 0) {
	                        nextGame(end());
	                    }
	                }
	            }
	        });
	        currentPlace.content = syllable;
	        currentPlace.unpress = () => {
	            currentPlace.pressed = false;
	            lineColor.setColor(colors.TRANSPARENT);
	            fillColor.setColor(colors.PH_BLUE);
	            textColor.setColor(colors.WHITE);
	        };
	        currentPlace.addTo(buttonBox);
	    });
	    let {
	        children
	    } = buttonBox;
	    prevHandler = () => {
	        if(gameState.paused) return;
	        if(input.length <= 0) return;
	        let last = input[input.length - 1];
	        input.pop();
	        inputBox.content = input.join("");
	        for(let child of children) {
	            if(child.content == last && child.pressed) {
	                child.unpress();
	                break;
	            }
	        }
	    };
	    inputBox.on("interactup", prevHandler);
	    await timeout(400);
	    return correct.toLocaleLowerCase();
	}
	async function end() {
	    inputBox.animateBound({
	        x: -1,
	        y: 0,
	        width: 3 / 3,
	        height: 1 / 4
	    }, 200, sineIn);
	    buttonBox.animateBound({
	        x: -1,
	        y: 1 / 4,
	        width: 3 / 3,
	        height: 3 / 4
	    }, 200, sineIn);
	    await timeout(200);
	    buttonBox.removeAllChildren();
	    inputBox.remove();
	    buttonBox.remove();
	}
	start$1.end = end;

	let allGames = [
	    start$1
	];
	let gameSize = allGames.length;
	let gameState;
	let score;
	let timer;
	let timerColor = new Color(colors.BLACK);
	let pauseColor = new Color(colors.WHITE);
	let hud = new Object2D({
	    children: [
	        new Horizontal({
	            x: 0,
	            y: 1,
	            width: 1,
	            height: 0,
	            line: colors.BLACK,
	            dash: [4, 4],
	            dashSpeed: 2 / 1000,
	            updateThickness,
	        }),
	        new Object2D({
	            x: 0 / 3,
	            y: 0 / 1,
	            width: 1 / 3,
	            height: 1 / 1,
	            child: new Object2D({
	                x: 3 / 10,
	                y: 3 / 10,
	                width: 4 / 10,
	                height: 4 / 10,
	                children: [
	                    new Rectangle({
	                        x: 0 / 3,
	                        y: 0 / 3,
	                        width: 1 / 3,
	                        height: 3 / 3,
	                        fill: pauseColor,
	                        line: colors.BLACK,
	                        updateThickness
	                    }),
	                    new Rectangle({
	                        x: 2 / 3,
	                        y: 0 / 3,
	                        width: 1 / 3,
	                        height: 3 / 3,
	                        fill: pauseColor,
	                        line: colors.BLACK,
	                        updateThickness
	                    })
	                ]
	            }),
	            oninteractdown() {
	                if(gameState.paused) return;
	                pauseColor.setColor(colors.SKY_BLUE);
	            },
	            oninteractup() {
	                if(gameState.paused) return;
	                pauseColor.setColor(colors.WHITE);
	                pause();
	            }
	        }),
	        new Object2D({
	            x: 1 / 3,
	            y: 0 / 1,
	            width: 1 / 3,
	            height: 1 / 1,
	            child: new RoundedRectangle({
	                x: 2 / 10,
	                y: 2 / 10,
	                width: 6 / 10,
	                height: 6 / 10,
	                fill: colors.PH_YELLOW,
	                radius: 2 / 10,
	                child: score = new Text({
	                    x: 0,
	                    y: 0,
	                    width: 1,
	                    height: 1,
	                    weight: "bold",
	                    font: "ComicNueue Angular",
	                    color: colors.BLACK,
	                    size: 6 / 10,
	                    content: "0"
	                })
	            })
	        }),
	        new Object2D({
	            x: 2 / 3,
	            y: 0 / 1,
	            width: 1 / 3,
	            height: 1 / 1,
	            child: timer = new Text({
	                x: 0,
	                y: 0 ,
	                width: 1,
	                height: 1,
	                color: timerColor,
	                size: 4 / 10,
	                weight: "bold",
	                font: "ComicNueue Angular",
	                content: ":10"
	            })
	        })
	    ]
	});
	let game = new Object2D;
	function startGame() {
	    gameState = new GameState;
	    hud.addTo(safeArea);
	    hud.setBound({
	        isPositionRelative: true,
	        isScaleRelative: true,
	        x: 0 / 3,
	        y: - 1 / 5,
	        width: 3 / 3,
	        height: 1 / 5
	    });
	    hud.animateBound({
	        isPositionRelative: true,
	        isScaleRelative: true,
	        x: 0 / 3,
	        y: 0 / 5,
	        width: 3 / 3,
	        height: 1 / 5
	    }, 400, expoOut);
	    game.addTo(safeArea);
	    game.setBound({
	        isPositionRelative: true,
	        isScaleRelative: true,
	        x: 0 / 3,
	        y:  1 / 5,
	        width: 3 / 3,
	        height: 4 / 5
	    });
	    timer.content = ":10";
	    newGame();
	}
	let prevHandler$1;
	let currentGame;
	async function newGame() {
	    let func = allGames[Math.floor(Math.random() * gameSize)];
	    let correct = await func();
	    let thisGame = currentGame;
	    let currentTime = gameState.time;
	    let previousTime;
	    prevHandler$1 = () => {
	        if(gameState.stopped) return;
	        let timeLeft = Math.ceil(10 + (currentTime - gameState.time) / 1000);
	        let timeLeftString = `${ timeLeft }`;
	        timer.content = `:${ `00${ timeLeftString }`.substring(timeLeftString.length) }`;
	        if(timeLeft !== previousTime && timeLeft <= 3) {
	            timerColor.setColor("#f00");
	            timerColor.animateColor(colors.BLACK, 1000);
	        }
	        previousTime = timeLeft;
	    };
	    scene.on("frame", prevHandler$1);
	    await gameState.timeout(10000);
	    if(thisGame !== currentGame) return;
	    gameState.stop();
	    scene.off("frame", prevHandler$1);
	    timer.content = ":O";
	    let oldUpdateBound = game.updateBound;
	    let startTime = now$1();
	    game.updateBound = function() {
	        oldUpdateBound.call(this);
	        let {
	            x,
	            width
	        } = this;
	        let alphaTime = ((now$1() - startTime) / 500) - 1;
	        this.x = x + (Math.sin(alphaTime * 8 * Math.PI) * alphaTime * width / 8);
	    };
	    await timeout(500);
	    game.updateBound = oldUpdateBound;
	    await timeout(500);
	    timer.content = ":(";
	    func.end();
	    let message = `
        Tamang Sagot: ${correct}
        Puntos: ${score.content}
        Simulan muli?
    `;
	    if(await popup(message, "Oo", "Hindi")) {
	        score.content = "0";
	        gameState = new GameState;
	        newGame();
	    }else{
	        score.content = "0";
	        exitGame();
	    }
	}
	async function nextGame(promise) {
	    score.content = `${ + score.content + 1 }`;
	    scene.off("frame", prevHandler$1);
	    timer.content = ":D";
	    currentGame = Symbol();
	    if(promise) await promise;
	    newGame();
	}
	async function pause() {
	    gameState.pause();
	    await start();
	    gameState.play();
	}
	async function exitGame() {
	    await hud.animateBound({
	        isPositionRelative: true,
	        isScaleRelative: true,
	        x: 0 / 3,
	        y: - 1 / 5,
	        width: 3 / 3,
	        height: 1 / 5
	    }, 200, sineIn);
	    hud.remove();
	    game.remove();
	    start$2();
	}

	let ongoing = false;
	let title;
	let shine;
	let titleBox = new Object2D({
		children: [
			title = new Image$1({
				x: 0,
				y: 0,
				width: 1,
				height: 1
			}),
			shine = new FreeForm({
				path: [
					[0    , 1],
					[3 / 4, 0],
					[1    , 0],
					[1 / 4, 1]
				],
				opacity: 1 / 4,
				fill: colors.WHITE,
				operation: "source-atop"
			})
		]
	});
	let buttonColor = new Color;
	let startButton = new RoundedRectangle({
		fill: buttonColor,
		cap: "flat",
		join: "miter",
		line: colors.BLACK,
		dash: [4, 4],
		dashSpeed: 4 / 1000,
		updateThickness,
		radius: 0.5,
		child: new Text({
			x: 0,
			y: 0,
			width: 1,
			height: 1,
			weight: "bold",
			font: "ComicNueue Angular",
			color: colors.BLACK,
			size: 6 / 10,
			content: "simulan"
		}),
		oninteractdown() {
			buttonColor.setColor(colors.WHITE);
		},
		oninteractup() {
			buttonColor.setColor(colors.PH_YELLOW);
			end$1();
		}
	});
	let titleBoxPos = updateBoundWrapper({
		x: 1 / 12,
		y: 0 / 20,
		width: 10 / 12,
		height: 14 / 20
	});
	let intervalID = -1;
	function start$2() {
		if(ongoing) return;
		title.source = images.TITLE_PNG;
		titleBox.setBound({
			x: 1 / 12,
			y: -16 / 20,
			width: 10 / 12,
			height: 14 / 20,
		});
		titleBox.addTo(safeArea);
		let startTime = now$1();
		titleBox.animateUpdateBound(function() {
			titleBoxPos.call(this);
			this.y += Math.sin((now$1() - startTime) / 2000 * Math.PI) * this.height / 64;
		}, 400, expoOut);
		shine.setBound({
			x: -1,
			y: 0,
			width: 1,
			height: 1,
		});
		intervalID = setInterval(() => {
			shine.setBound({
				x: -1,
				y: 0,
				width: 1,
				height: 1,
			});
			shine.animateBound({
				x: 1,
				y: 0,
				width: 1,
				height: 1,
			}, 750, linear);
		}, 4000);
		buttonColor.setColor(colors.PH_YELLOW);
		startButton.setBound({
			x: 1 / 6,
			y: 10 / 10,
			width: 4 / 6,
			height: 1 / 10,
		});
		startButton.addTo(safeArea);
		startButton.animateBound({
			x: 1 / 6,
			y: 7 / 10,
			width: 4 / 6,
			height: 1 / 10,
		}, 400, expoOut);
		ongoing = true;
	}
	function end$1() {
		if(! ongoing) return;
		startButton.animateBound({
			x: 1 / 6,
			y: 10 / 10,
			width: 4 / 6,
			height: 1 / 10
		}, 200, sineIn).then(() => {
			startButton.remove();
		});
		titleBox.animateBound({
			x: 1 / 12,
			y: -16 / 20,
			width: 10 / 12,
			height: 14 / 20
		}, 200, sineIn).then(() => {
			titleBox.remove();
		});
		clearInterval(intervalID);
		timeout(200).then(() => {
			startGame();
		});
		ongoing = false;
	}

	let loading = new Horizontal({
		cap: "flat",
		join: "miter",
		line: colors.BLACK,
		dash: [4, 4],
		dashSpeed: 1 / 100,
		updateThickness,
	});
	async function load(promise) {
		loading.addTo(safeArea);
		loading.setBound({
			x: 2 / 6,
			y: 10 / 10,
			width: 2 / 6,
			height: 2 / 10,
		});
		await loading.animateBound({
			x: 2 / 6,
			y: 8 / 10,
			width: 2 / 6,
			height: 2 / 10
		}, 200, sineOut);
		await promise;
		await loading.animateBound({
			x: 2 / 6,
			y: 10 / 10,
			width: 2 / 6,
			height: 2 / 10
		}, 200, sineIn);
		loading.remove();
	}

	let canvas = document.querySelector("canvas#scene");
	let scene = new Scene({
		canvas: canvas,
		autoresize: true,
		child: new Rectangle({
			x: 0,
			y: 0,
			width: 1,
			height: 1,
			z: 2,
			fill: colors.WHITE,
			operation: "destination-over"
		})
	});
	let safeArea = new SafeArea({
		ratio: 3 / 5,
		parent: scene
	});
	function updateThickness() {
		this.thickness = safeArea.width / 100;
	}load(assets).then(() => {
		start$2();
	});

	exports.canvas = canvas;
	exports.safeArea = safeArea;
	exports.scene = scene;
	exports.updateThickness = updateThickness;

	return exports;

}({}));
