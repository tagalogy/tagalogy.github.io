var main = (function (exports) {
    'use strict';

    class EventTarget {
        constructor(option = {}) {
            this.listeners = new Map();
            for (let name in option) if (name.substring(0, 2) == "on") this.on(name.substring(2), option[name]);
        }
        getHandler(name) {
            let listeners = this.listeners;
            let handlers = listeners.get(name);
            if (!handlers) listeners.set(name, handlers = []);
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
                    if (handler) handler();
                    resolve();
                };
                this.on(name, sub);
            });
        }
        off(name, handler) {
            let handlers = this.getHandler(name);
            let index = handlers.indexOf(handler);
            if (index >= 0) handlers.splice(index, 1);
        }
        invoke(name) {
            let handlers = this.getHandler(name);
            for (let handler of handlers) handler.call(this);
        }
    }
    //TODO: bubbling and propagation cancellation

    let sin = Math.sin;
    const PI = Math.PI;
    function wrapper(func) {
        return num => {
            if (num <= 0) return 0;
            if (num >= 1) return 1;
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

    class Object2D extends EventTarget {
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
            if (parent) this.addTo(parent);
            if (child) this.addChild(child);
            if (children) this.addChildren(children);
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
            if (parent) parent.updateDrawOrder();
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
            this.updateBound = function () {
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
            this.updateOpacity = function () {
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
            if (includeThis) callback(this);
            for (let child of this.children) child.forEachDescendant(callback, true);
        }
        /*
        Draw Methods
        */
        updateDrawOrder(deep = false) {
            let { children } = this;
            children.sort((a, b) => a.z - b.z);
            if (deep) for (let child of children) child.updateDrawOrder(true);
        }
        draw(context, drawChildren = true) {
            if (!this.visible) return;
            this.updateOpacity();
            context.globalAlpha = this.opacity;
            context.globalCompositeOperation = this.operation;
            if (drawChildren) this.drawChildren(context);
        }
        drawChildren(context) {
            for (let child of this.children) child.draw(context);
        }
        /*
        setscene Method
        */
        setscene(scene) {
            this.scene = scene;
            for (let child of this.children) child.setscene(scene);
        }
        /*
        Tree Methods
        */
        addChild(child, updateDrawOrder = true) {
            if (child instanceof Scene) throw new Error("Unable to add scene as a child");
            child.invoke("beforeadd");
            child.remove(false);
            child.parent = this;
            child.setscene(this.scene);
            this.children.push(child);
            if (updateDrawOrder) this.updateDrawOrder();
            child.invoke("afteradd");
        }
        addChildren(children, updateDrawOrder = true) {
            for (let child of children) this.addChild(child, false);
            if (updateDrawOrder) this.updateDrawOrder();
        }
        addTo(parent, updateDrawOrder) {
            parent.addChild(this, updateDrawOrder);
        }
        removeChild(child, setscene = true) {
            if (child.parent !== this) return;
            child.invoke("beforeremove");
            child.parent = null;
            if (setscene) child.setscene(null);
            let { children } = this;
            children.splice(children.indexOf(child), 1);
            child.invoke("afterremove");
        }
        remove(setscene = true) {
            let {
                parent
            } = this;
            if (parent) parent.removeChild(this, setscene);
        }
        removeChildren(children) {
            for (let child of children) this.removeChild(child);
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
        if (updateBound) return updateBound;
        let {
            x = 0,
            y = 0,
            width = 0,
            height = 0,
            isPositionRelative = true,
            isScaleRelative = true
        } = option;
        return function () {
            let {
                parent
            } = this;
            let offsetX, offsetY, offsetWidth, offsetHeight;
            if (parent) {
                parent.updateBound();
                offsetX = isPositionRelative ? parent.x : 0;
                offsetY = isPositionRelative ? parent.y : 0;
                offsetWidth = isScaleRelative ? parent.width : 1;
                offsetHeight = isScaleRelative ? parent.height : 1;
            } else {
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
        if (typeof option == "number") {
            option = {
                opacity: option
            };
        }
        let {
            updateOpacity
        } = option;
        if (updateOpacity) return updateOpacity;
        let {
            opacity = 1,
            isOpacityRelative = true
        } = option;
        return function () {
            let {
                parent
            } = this;
            if (parent && isOpacityRelative) {
                parent.updateOpacity();
                this.opacity = opacity * parent.opacity;
            } else {
                this.opacity = opacity;
            }
        }
    }

    class Frame {
        constructor(onframe) {
            this.playing = true;
            let callback = () => {
                if (!this.playing) return;
                onframe();
                requestAnimationFrame(callback);
            };
            requestAnimationFrame(callback);
        }
        stop() {
            this.playing = false;
        }
    }

    class Color {
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
            this.updateColor = function () {
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
        if (typeof option == "string") {
            option = option.trim();
            if (option[0] == "#") {
                let rawString = option.substr(1);
                let raw = parseInt(rawString, 16);
                let red, green, blue, alpha;
                switch (rawString.length) {
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
                return function () {
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
        if (updateColor) return updateColor;
        let {
            red = 255,
            green = 255,
            blue = 255,
            alpha = 1
        } = option;
        return function () {
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
            if (option.autoresize) {
                this.updateBound = function () {
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
                        if (descendant.hitTest(x * scale, y * scale)) {
                            descendant.invoke(eventName);
                            if (eventName == "mousedown") descendant.invoke("interactdown");
                            if (eventName == "mouseup") descendant.invoke("interactup");
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
                        if (touches.some(touch => descendant.hitTest(touch.pageX * scale, touch.pageY * scale))) {
                            if (eventName == "touchstart") descendant.invoke("interactdown");
                            if (eventName == "touchend") descendant.invoke("interactup");
                        }
                    });
                });
            });
        }
        draw(context, drawChildren = true) {
            if (!this.visible) return;
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
            if (drawChildren) this.drawChildren(context);
        }
    }

    let min = Math.min;
    class SafeArea extends Object2D {
        constructor(option = {}) {
            super(option);
            let {
                ratio
            } = option;
            this.updateBound = function () {
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
            for (let num of dash) sum += num;
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
            if (!this.visible) return;
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
            if (drawChildren) this.drawChildren(context);
        }
    }
    function updateThicknessWrapper(option) {
        if (typeof option == "number") {
            return function () {
                return option;
            };
        }
        let { updateThickness } = option;
        if (updateThickness) return updateThickness;
        let { thickness = 2 } = option;
        return function () {
            this.thickness = thickness;
        }
    }

    class Rectangle extends Base {
        draw(context, drawChildren = true) {
            if (!this.visible) return;
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
            if (drawChildren) this.drawChildren(context);
        }
    }

    function loadImage(src, alt = "") {
        return new Promise((resolve, reject) => {
            let image = new Image;
            image.src = src;
            image.alt = alt;
            image.addEventListener("load", function () {
                resolve(image);
            });
            image.addEventListener("error", function () {
                reject(`Unable to load ${alt} from ${src}`);
            });
        });
    }
    function loadImages(srcs) {
        return Promise.all(srcs.map(src => loadImage(src)));
    }

    function get(url) {
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest;
            xhr.addEventListener("load", () => {
                if (xhr.status === 200) {
                    resolve(xhr.responseText);
                } else {
                    reject(xhr.status);
                }
            });
            xhr.addEventListener("error", () => {
                reject();
            });
            xhr.open("GET", url);
            xhr.send();
        });
    }
    function getAll(urls) {
        return Promise.all(urls.map(url => get(url)));
    }

    function loadAudio(src) {
        return new Promise((resolve, reject) => {
            let audio = new Audio(src);
            audio.addEventListener("canplaythrough", () => {
                resolve(audio);
            });
            audio.addEventListener("error", () => {
                reject(`Unable to load Audio from ${src}`);
            });
        });
    }
    function loadAllAudio(srcs) {
        return Promise.all(srcs.map(src => loadAudio(src)));
    }

    let sfx = {};
    let words = {};
    let images = {};
    let difficulties = {};
    const SPACES = /\s+/;
    async function loadAll() {
        [
            images.TITLE_PNG,
            images.TITLE_DARK_PNG,
            images.BULB_PNG
        ] = await loadImages(`
        /asset/title.png
        /asset/title_dark.png
        /asset/bulb.png
    `.trim().split(SPACES));
        [
            words.WORD_3,
            words.WORD_4,
            words.WORD_5,
            words.WORD_6
        ] = (await getAll(`
        /asset/word_3.txt
        /asset/word_4.txt
        /asset/word_5.txt
        /asset/word_6.txt
    `.trim().split(SPACES))).map(text => text.split(SPACES));
        difficulties.EASY = [...words.WORD_3].sort();
        difficulties.MEDIUM = [...words.WORD_3, ...words.WORD_4].sort();
        difficulties.HARD = [...words.WORD_4, ...words.WORD_5].sort();
        difficulties.VERY_HARD = [...words.WORD_5, ...words.WORD_6].sort();
        [
            sfx.ADVANCE,
            sfx.CLICK,
            sfx.FAIL,
            sfx.GAME_OVER
        ] = await loadAllAudio(`
        /asset/sfx/advance.mp3
        /asset/sfx/click.mp3
        /asset/sfx/fail.mp3
        /asset/sfx/game_over.mp3
    `.trim().split(SPACES));
    }
    let assets = loadAll();
    let colors = {
        BACKGROUND: new Color("#fff"),
        FOREGROUND: new Color("#000"),
        ACCENT: new Color("#0038a8"),

        TRANSPARENT: new Color("#0000"),
        WHITE: new Color("#fff"),
        BLACK: new Color("#000"),
        PH_BLUE: new Color("#0038a8"),
        SKY_BLUE: new Color("#0f5fff"),
        PH_RED: new Color("#ce1126"),
        PH_YELLOW: new Color("#fdc116"),
    };

    let supported = (() => {
        //https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
        let storage;
        try {
            storage = window.localStorage;
            let x = '__storage_test__';
            storage.setItem(x, x);
            storage.removeItem(x);
            return true;
        } catch (error) {
            return error instanceof DOMException && (
                // everything except Firefox
                error.code === 22 ||
                // Firefox
                error.code === 1014 ||
                // test name field too, because code might not be present
                // everything except Firefox
                error.name === 'QuotaExceededError' ||
                // Firefox
                error.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
                // acknowledge QuotaExceededError only if there's something already stored
                (storage && storage.length !== 0);
        }
    })();
    let storage;
    var storage$1 = storage = {
        weakHasItem(name) {
            if (!supported) return false;
            return storage.weakGetItem(name) !== null;
        },
        weakGetItem(name) {
            if (!supported) return null;
            try {
                return JSON.parse(localStorage.getItem(name));
            } catch (error) {
                return null;
            }
        },
        weakSetItem(name, value) {
            if (!supported) return;
            try {
                localStorage.setItem(name, JSON.stringify(value));
            } catch (error) { }
        },
        weakRemoveItem(name) {
            if (!supported) return;
            localStorage.removeItem(name);
        },
        get map() {
            let { _map: map } = storage;
            if (map) return map;
            map = storage._map = new Map;
            if (!supported) return map;
            for (let ind = 0, len = localStorage.length; ind < len; ind++) {
                let name = localStorage.key(ind);
                map.set(name, storage.weakGetItem(name));
            }
            return map;
        },
        hasItem(name) {
            return storage.map.has(name);
        },
        getItem(name) {
            return storage.map.get(name);
        },
        setItem(name, value) {
            storage.map.set(name, value);
            if (value == null) {
                storage.weakRemoveItem(name);
            } else {
                storage.weakSetItem(name, value);
            }
        },
        removeItem(name) {
            storage.setItem(name, null);
        },
        setDefault(name, value) {
            if (!storage.hasItem(name)) storage.setItem(name, value);
        },
        setAllDefault(option) {
            for (let name in option) storage.setDefault(name, option[name]);
        }
    };

    let min$1 = Math.min;
    class RoundedRectangle extends Base {
        constructor(option = {}) {
            super(option);
            this.setRadius(option);
        }
        setRadius(option) {
            this.updateRadius = updateRadiusWrapper(option);
        }
        draw(context, drawChildren = true) {
            if (!this.visible) return;
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
            if (drawChildren) this.drawChildren(context);
        }
    }
    function updateRadiusWrapper(option) {
        if (typeof option == "number") {
            return function () {
                return option;
            };
        }
        let { updateRadius } = option;
        if (updateRadius) return updateRadius;
        let {
            radius = 0,
            isRadiusRelative = true
        } = option;
        return function () {
            if (isRadiusRelative) {
                let {
                    width,
                    height
                } = this;
                this.radius = min$1(width, height) * radius;
            } else {
                this.radius = radius;
            }
        }
    }

    class Text extends Object2D {
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
            if (!this.visible) return;
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
            if (typeof font == "string") font = [font];
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
            switch (align) {
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
            if (wrap) {
                let lines = getLines(context, content, width);
                let len = lines.length;
                switch (baseline) {
                    case "middle": finalY -= len * size / 2; break;
                    case "bottom": finalY -= len * size; break;
                }
                for (let ind = 0; ind < len; ind++) context.fillText(lines[ind], finalX, finalY + size * ind);
            } else {
                context.fillText(content, finalX, finalY);
            }
            if (drawChildren) this.drawChildren(context);
        }
    }
    function updateSizeWrapper(option) {
        if (typeof option == "number") {
            return function () {
                return option;
            };
        }
        let { updateSize } = option;
        if (updateSize) return updateSize;
        let {
            size = 10,
            isSizeRelative = true
        } = option;
        return function () {
            if (isSizeRelative) {
                this.size = size * this.height;
            } else {
                this.size = size;
            }
        }
    }
    const NEWLINES = /\r\n|\r|\n/;
    const SPACES$1 = /\s+/;
    function getLines(context, text, maxWidth) {
        let lines = [];
        for (let paragraph of text.trim().split(NEWLINES)) {
            let words = paragraph.trim().split(SPACES$1);
            let [currentLine, ...nextLine] = words;
            for (let word of nextLine) {
                let currentWord = `${currentLine} ${word}`;
                let { width } = context.measureText(currentWord);
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
    class Image$1 extends Object2D {
        constructor(option = {}) {
            super(option);
            this.source = option.source;
            let {
                imageScaling = "fit"
            } = option;
            this.imageScaling = imageScaling;
        }
        draw(context, drawChildren = true) {
            if (!this.visible) return;
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
            if (imageScaling == "fit") {
                let scaleX = rawDestWidth / rawSrcWidth;
                let scaleY = rawDestHeight / rawSrcHeight;
                let scale = min$2(scaleX, scaleY);
                let width = scale * rawSrcWidth;
                let height = scale * rawSrcHeight;
                context.drawImage(source, x + (rawDestWidth - width) / 2, y + (rawDestHeight - height) / 2, width, height);
            }
            if (drawChildren) this.drawChildren(context);
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
            if (!this.visible) return;
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
            for (let ind = 1, len = path.length; ind < len; ind++) {
                context.lineTo(x + path[ind][0] * width, y + path[ind][1] * height);
            }
            context.closePath();
            context.fill();
            context.stroke();
            if (drawChildren) this.drawChildren(context);
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
            this.updateCoords = function () {
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
            if (!this.visible) return;
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
            if (drawChildren) this.drawChildren(context);
        }
    }
    function updateCoordsWrapper(option) {
        let { updateCoords } = option;
        if (updateCoords) return updateCoords;
        let {
            x0 = 0,
            y0 = 0,
            x1 = 0,
            y1 = 0
        } = option;
        return function () {
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

    class GameState extends EventTarget {
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
            if (this.paused) return this.timeWhenPaused;
            return now() - this.startTime - this.pauseTime;
        }
        pause() {
            if (this.paused) return;
            this.timeWhenPaused = this.time;
            this.pauseStartTime = now();
            this.paused = true;
            this.invoke("pause");
        }
        play() {
            if (this.stopped || !this.paused) return;
            this.pauseTime += now() - this.pauseStartTime;
            this.paused = false;
            this.invoke("play");
        }
        toggle() {
            if (this.paused) {
                this.play();
            } else {
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
                let detach = () => {
                    this.off("play", onplay);
                    this.off("pause", onpause);
                };
                let onplay = () => {
                    id = setTimeout(() => {
                        detach();
                        resolve();
                    }, timeLeft);
                };
                let onpause = () => {
                    timeLeft -= this.time - timeStart;
                    timeStart = this.time;
                    clearTimeout(id);
                };
                if (!this.paused) onplay();
                this.on("play", onplay);
                this.on("pause", onpause);
                this.once("stop", () => {
                    detach();
                    reject();
                });
            });
        }
    }

    let dialogBox, msgBox, cancelBox, okBox, cancelText, okText;
    let cancelFill = new Color;
    let cancelColor = new Color;
    let okFill = new Color;
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
                fill: colors.BACKGROUND,
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
                        color: colors.FOREGROUND
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
                                    cancelFill.setColor(colors.BACKGROUND);
                                    cancelColor.setColor(colors.FOREGROUND);
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
                                    okFill.setColor(colors.BACKGROUND);
                                    okColor.setColor(colors.FOREGROUND);
                                },
                                oninteractup() {
                                    okFill.setColor(colors.ACCENT);
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
        okFill.setColor(colors.ACCENT);
        cancelFill.setColor(colors.BACKGROUND);
        cancelColor.setColor(colors.FOREGROUND);
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
        fill: colors.BACKGROUND,
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
                color: colors.FOREGROUND
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

    const SPACE = /\s+/;
    const NEWLINE = /\r\n|\r|\n/;
    function toSet(string) {
        return new Set(string.trim().split(SPACE));
    }
    function toMap(string) {
        return new Map(string.trim().split(NEWLINE).map(line => {
            let value = line.trim().split("/").map(string => string.trim());
            return [value.join(""), value];
        }));
    }
    const FIRST_CONSONANT = toSet(`
    B BL BR BW BY
    K KL KR KW KY
    D DR DY
    G GL GR GW
    H
    L
    M MY
    N NY
    Ŋ
    P PL PR PY
    R
    S SH SW
    T TR TS TY
    W
    Y
`);
    FIRST_CONSONANT.add("");
    const LAST_CONSONANT = toSet(`
    B
    K KS
    D DS
    G
    L LD LM LP LS LT
    M MP MS
    N ND NK NKS NS NT
    Ŋ ŊS
    P PS
    R RB RD RK RM RN RP RS RT
    S SH SK SM ST
    T TS
    W WG WN
    Y YK YL YM YN YR YS YT
`);
    LAST_CONSONANT.add("");
    const SPECIAL = toMap(`
    B/L
    /BR
    B/W
    B/Y
    /DR
    D/S
    D/SH
    D/SW
    D/Y
    G/L
    G/R
    G/W
    K/L
    /KR
    K/S
    K/SH
    K/SW
    K/W
    K/Y
    L/D
    L/DR
    L/DY
    L/M
    L/MY
    L/P
    L/PL
    L/PR
    L/PY
    L/S
    L/SH
    L/SW
    L/T
    L/TR
    LT/S
    LT/Y
    M/P
    M/PL
    M/PR
    M/PY
    M/S
    M/SH
    M/SW
    M/Y
    N/D
    N/DR
    N/DY
    N/K
    N/KL
    N/KR
    NK/S
    NK/SH
    NK/SW
    N/KW
    N/KY
    N/S
    N/SH
    N/SW
    N/T
    N/TR
    N/TS
    N/TY
    N/Y
    P/L
    /PR
    P/S
    P/SH
    P/SW
    P/Y
    R/B
    R/BL
    R/BR
    R/BW
    R/BY
    R/D
    R/DR
    R/DY
    R/K
    R/KL
    R/KR
    R/KW
    R/KY
    R/M
    RM/Y
    R/N
    RN/Y
    R/P
    R/PL
    R/PR
    R/PY
    R/S
    R/SH
    R/SW
    R/T
    R/TR
    RT/S
    RT/Y
    /SH
    S/K
    S/KL
    S/KR
    S/KW
    S/KY
    S/M
    S/MY
    S/T
    S/TR
    ST/S
    ST/Y
    S/W
    /TR
    /TS
    T/SH
    T/SW
    T/Y
    W/G
    W/GL
    W/GR
    W/GW
    W/N
    W/NY
    Y/K
    Y/KL
    Y/KR
    Y/KW
    Y/KY
    Y/L
    Y/M
    Y/MY
    Y/N
    Y/NY
    Y/R
    Y/S
    Y/SH
    Y/SW
    Y/T
    Y/TR
    Y/TS
    Y/TY
    Ŋ/S
    Ŋ/SH
    Ŋ/SW
`);
    function splitConsonant(consonant) {
        if (consonant.length <= 0) return ["", ""];
        if (consonant.length <= 1) return ["", consonant];
        if (SPECIAL.has(consonant)) return SPECIAL.get(consonant);
        for (let i = 0, len = consonant.length; i <= len; i++) {
            let lastRaw = consonant.slice(0, i);
            let firstRaw = consonant.slice(i);
            if (FIRST_CONSONANT.has(firstRaw) && LAST_CONSONANT.has(lastRaw)) {
                let result = [lastRaw, firstRaw];
                SPECIAL.set(consonant, result);
                return result;
            }
        }
        return null;
    }
    const HYPHEN = /(\-)/;
    const VOWEL = /([AEIOU])/;
    const NG = /NG/g;
    const ENG = /Ŋ/g;
    function parsePartialWord(word) {
        word = word.toUpperCase().replace(NG, "Ŋ");
        let tokens = word.split(VOWEL);
        let sliced = [tokens[0]];
        for (let token of tokens.slice(1, -1)) {
            if (VOWEL.test(token)) {
                sliced.push(token);
                continue;
            }
            let [lastRaw, firstRaw] = splitConsonant(token);
            sliced.push(lastRaw);
            sliced.push(firstRaw);
        }
        sliced.push(tokens[tokens.length - 1]);
        let syllables = [];
        for (let ind = 0, len = sliced.length; ind < len; ind += 3) {
            syllables.push(sliced.slice(ind, ind + 3).join("").replace(ENG, "NG"));
        }
        return syllables;
    }
    function parseWord(word) {
        let result = [];
        for (let partialWord of word.split(HYPHEN)) {
            if (partialWord === "-") {
                result.push("-");
                continue;
            }
            for (let syllable of parsePartialWord(partialWord)) result.push(syllable);
        }
        return result;
    }

    let outputColor = new Color(colors.FOREGROUND);
    let outputBox = new Text({
        font: "ComicNueue Angular",
        weight: "bold",
        size: 4 / 10,
        color: outputColor
    });
    let syllableBox;
    let clearFill = new Color;
    let clearLine = new Color;
    let clearColor = new Color;
    let hyphenFill = new Color;
    let hyphenLine = new Color;
    let hyphenColor = new Color;
    let clearPlace, hyphenPlace;
    let inputBox = new Object2D({
        children: [
            syllableBox = new Object2D({
                x: 0 / 4,
                y: 0 / 5,
                width: 3 / 4,
                height: 5 / 5
            }),
            new Object2D({
                x: 3 / 4,
                y: 0 / 5,
                width: 1 / 4,
                height: 5 / 5,
                children: [
                    clearPlace = new Object2D({
                        x: 0,
                        y: 3 / 5,
                        width: 1,
                        height: 1 / 5,
                        child: new RoundedRectangle({
                            x: 1 / 8,
                            y: 1 / 8,
                            width: 6 / 8,
                            height: 6 / 8,
                            dash: [2, 2],
                            dashSpeed: 2 / 1000,
                            fill: clearFill,
                            line: clearLine,
                            updateThickness,
                            radius: 1 / 2,
                            child: new Text({
                                x: 0,
                                y: 0,
                                width: 1,
                                height: 1,
                                font: "ComicNueue Angular",
                                color: clearColor,
                                size: 10 / 10,
                                content: "×",
                            })
                        }),
                        oninteractdown() {
                            clearColor.setColor(colors.BLACK);
                        }
                    }),
                    hyphenPlace = new Object2D({
                        x: 0,
                        y: 4 / 5,
                        width: 1,
                        height: 1 / 5,
                        child: new RoundedRectangle({
                            x: 1 / 8,
                            y: 1 / 8,
                            width: 6 / 8,
                            height: 6 / 8,
                            dash: [2, 2],
                            dashSpeed: 2 / 1000,
                            fill: hyphenFill,
                            line: hyphenLine,
                            updateThickness,
                            radius: 1 / 2,
                            child: new Text({
                                x: 0,
                                y: 0,
                                width: 1,
                                height: 1,
                                font: "ComicNueue Angular",
                                color: hyphenColor,
                                size: 10 / 10,
                                content: "-",
                            })
                        }),
                        oninteractdown() {
                            hyphenColor.setColor(colors.BLACK);
                        }
                    })
                ]
            })
        ]
    });
    let prevClearHandler;
    let prevHyphenHandler;
    async function start$1(wordBank) {
        outputColor.setColor(colors.FOREGROUND);
        clearFill.setColor(colors.BACKGROUND);
        clearLine.setColor(colors.PH_RED);
        clearColor.setColor(colors.PH_RED);
        hyphenFill.setColor(colors.ACCENT);
        hyphenLine.setColor(colors.TRANSPARENT);
        hyphenColor.setColor(colors.WHITE);
        if (prevClearHandler) clearPlace.off("interactup", prevClearHandler);
        if (prevHyphenHandler) hyphenPlace.off("interactup", prevHyphenHandler);
        outputBox.content = "";
        outputBox.addTo(game);
        outputBox.setBound({
            x: 1,
            y: 0,
            width: 3 / 3,
            height: 1 / 4
        });
        outputBox.animateBound({
            x: 0,
            y: 0,
            width: 3 / 3,
            height: 1 / 4
        }, 400, expoOut);
        inputBox.addTo(game);
        inputBox.setBound({
            x: 1,
            y: 1 / 4,
            width: 8 / 10,
            height: 3 / 4
        });
        inputBox.animateBound({
            x: 1 / 10,
            y: 1 / 4,
            width: 8 / 10,
            height: 3 / 4
        }, 400, expoOut);
        let correct = wordBank[Math.floor(Math.random() * wordBank.length)];
        let word = parseWord(correct).filter(syllable => syllable !== "-");
        word.sort(() => Math.random() - Math.random());
        let currentPressed = 0;
        let currentLen = word.length;
        prevClearHandler = (bool) => {
            if (gameState.paused) return;
            if (! bool) sfx.CLICK.play();
            outputBox.content = "";
            currentPressed = 0;
            for (let button of syllableBox.children) button.unpress();
            clearFill.setColor(colors.BACKGROUND);
            clearLine.setColor(colors.PH_RED);
            clearColor.setColor(colors.PH_RED);
            hyphenFill.setColor(colors.ACCENT);
            hyphenLine.setColor(colors.TRANSPARENT);
            hyphenColor.setColor(colors.WHITE);
        };
        clearPlace.on("interactup", prevClearHandler);
        prevHyphenHandler = () => {
            if (gameState.paused) return;
            sfx.CLICK.play();
            if (!outputBox.content.endsWith("-")) outputBox.content += "-";
            clearFill.setColor(colors.PH_RED);
            clearLine.setColor(colors.TRANSPARENT);
            clearColor.setColor(colors.WHITE);
            hyphenFill.setColor(colors.BACKGROUND);
            hyphenLine.setColor(colors.ACCENT);
            hyphenColor.setColor(colors.ACCENT);
        };
        hyphenPlace.on("interactup", prevHyphenHandler);
        let { length } = word;
        word.forEach((syllable, ind) => {
            syllable = syllable.toLowerCase();
            let lineColor = new Color(colors.TRANSPARENT);
            let fillColor = new Color(colors.ACCENT);
            let textColor = new Color(colors.WHITE);
            let width = 1;
            let x = 0;
            if (length >= 6 && ind > 3) {
                width = 2 / 3;
                if (ind > 4) x = 2 / 3;
            }
            let innerWidth;
            let innerX;
            if (length >= 6 && ind > 4) {
                innerWidth = 14 / 16;
                innerX = 1 / 16;
            } else {
                innerWidth = 46 / 48;
                innerX = 1 / 48;
            }
            let y = (4 - ind) / 5;
            if (ind > 4) y = 0;
            let currentPlace = new Object2D({
                x,
                y,
                width,
                height: 1 / 5,
                child: new RoundedRectangle({
                    x: innerX,
                    y: 1 / 8,
                    width: innerWidth,
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
                oninteractdown() {
                    if (gameState.paused) return;
                    textColor.setColor(colors.BLACK);
                },
                async oninteractup() {
                    if (gameState.paused) return;
                    lineColor.setColor(colors.ACCENT);
                    fillColor.setColor(colors.BACKGROUND);
                    textColor.setColor(colors.ACCENT);
                    clearFill.setColor(colors.PH_RED);
                    clearLine.setColor(colors.TRANSPARENT);
                    clearColor.setColor(colors.WHITE);
                    hyphenFill.setColor(colors.ACCENT);
                    hyphenLine.setColor(colors.TRANSPARENT);
                    hyphenColor.setColor(colors.WHITE);
                    if (this.pressed) return;
                    this.pressed = true;
                    outputBox.content += this.content;
                    currentPressed++;
                    if (currentPressed < currentLen) return;
                    if (wordBank.indexOf(outputBox.content.toUpperCase()) >= 0) {
                        sfx.ADVANCE.play();
                        nextGame(end());
                        return;
                    }
                    sfx.CLICK.play();
                    outputColor.setColor("#f00");
                    await outputColor.animateColor("#f000", 200);
                    prevClearHandler(true);
                    outputColor.setColor(colors.FOREGROUND);
                }
            });
            currentPlace.content = syllable;
            currentPlace.unpress = () => {
                if (!currentPlace.pressed) return;
                currentPlace.pressed = false;
                lineColor.setColor(colors.TRANSPARENT);
                fillColor.setColor(colors.ACCENT);
                textColor.setColor(colors.WHITE);
            };
            currentPlace.addTo(syllableBox);
        });
        await timeout(400);
        return correct.toLocaleLowerCase();
    }
    async function end() {
        outputBox.animateBound({
            x: -1,
            y: 0,
            width: 3 / 3,
            height: 1 / 4
        }, 200, sineIn);
        inputBox.animateBound({
            x: -1,
            y: 1 / 4,
            width: 3 / 3,
            height: 3 / 4
        }, 200, sineIn);
        await timeout(200);
        syllableBox.removeAllChildren();
        outputBox.remove();
        inputBox.remove();
    }
    start$1.end = end;

    let gameState;
    let time = 20;
    let score;
    let timer;
    let timerColor = new Color;
    let pauseColor = new Color;
    let hud = new Object2D({
        children: [
            new Horizontal({
                x: 0,
                y: 1,
                width: 1,
                height: 0,
                line: colors.FOREGROUND,
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
                            line: colors.FOREGROUND,
                            updateThickness
                        }),
                        new Rectangle({
                            x: 2 / 3,
                            y: 0 / 3,
                            width: 1 / 3,
                            height: 3 / 3,
                            fill: pauseColor,
                            line: colors.FOREGROUND,
                            updateThickness
                        })
                    ]
                }),
                oninteractdown() {
                    if (gameState.paused) return;
                    pauseColor.setColor(colors.SKY_BLUE);
                },
                oninteractup() {
                    if (gameState.paused) return;
                    sfx.CLICK.play();
                    pauseColor.setColor(colors.BACKGROUND);
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
                    y: 0,
                    width: 1,
                    height: 1,
                    color: timerColor,
                    size: 4 / 10,
                    weight: "bold",
                    font: "ComicNueue Angular",
                    content: `:${time}`
                })
            })
        ]
    });
    let currentDifficulty;
    let wordBank;
    let game = new Object2D;
    function startGame(name, bank) {
        currentDifficulty = name;
        wordBank = bank;
        timerColor.setColor(colors.FOREGROUND);
        pauseColor.setColor(colors.BACKGROUND);
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
            y: 1 / 5,
            width: 3 / 3,
            height: 4 / 5
        });
        timer.content = `:${time}`;
        newGame();
    }
    let prevHandler;
    let currentGame;
    async function newGame() {
        let correct = await start$1(wordBank);
        let thisGame = currentGame;
        let currentTime = gameState.time;
        let previousTime;
        prevHandler = () => {
            if (gameState.stopped) return;
            let timeLeft = Math.ceil(time + (currentTime - gameState.time) / 1000);
            let timeLeftString = `${timeLeft}`;
            timer.content = `:${`00${timeLeftString}`.substring(timeLeftString.length)}`;
            if (timeLeft !== previousTime && timeLeft <= 5) {
                timerColor.setColor("#f00");
                timerColor.animateColor(colors.FOREGROUND, 1000);
            }
            previousTime = timeLeft;
        };
        scene.on("frame", prevHandler);
        await gameState.timeout(time * 1000);
        if (thisGame !== currentGame) return;
        sfx.FAIL.play();
        gameState.stop();
        scene.off("frame", prevHandler);
        timer.content = ":O";
        let oldUpdateBound = game.updateBound;
        let startTime = now$1();
        game.updateBound = function () {
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
        let high = storage$1.getItem(currentDifficulty);
        let currentScore = + score.content;
        if (high < currentScore) storage$1.setItem(currentDifficulty, currentScore);
        timer.content = ":(";
        end();
        let message = `
        Tamang Sagot: ${correct}
        Puntos: ${score.content}
        Simulan muli?
    `;
        sfx.GAME_OVER.play();
        if (await popup(message, "Oo", "Hindi")) {
            score.content = "0";
            gameState = new GameState;
            newGame();
        } else {
            score.content = "0";
            exitGame();
        }
    }
    async function nextGame(promise) {
        score.content = `${+ score.content + 1}`;
        scene.off("frame", prevHandler);
        timer.content = ":D";
        currentGame = Symbol();
        if (promise) await promise;
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
        start$3();
    }

    let raw = [
        {
            name: "madali",
            description: "3 pantig",
            difficultyKey: "EASY",
            highscoreKey: "highscore_easy"
        },
        {
            name: "katamtaman",
            description: "3-4 pantig",
            difficultyKey: "MEDIUM",
            highscoreKey: "highscore_medium"
        },
        {
            name: "mahirap",
            description: "4-5 pantig",
            difficultyKey: "HARD",
            highscoreKey: "highscore_hard"
        },
        {
            name: "mas mahirap",
            description: "5-6 pantig",
            difficultyKey: "VERY_HARD",
            highscoreKey: "highscore_veryHard"
        }
    ];
    let box = new Object2D;
    let highscore = Object.create(null);
    let fill = colors.ACCENT;
    raw.forEach(({ name, description, difficultyKey, highscoreKey }, ind) => {
        let highscoreText;
        box.addChild(new Object2D({
            x: 0,
            y: ind / 4,
            width: 1,
            height: 1 / 4,
            child: new RoundedRectangle({
                x: 1 / 16,
                y: 1 / 16,
                width: 14 / 16,
                height: 14 / 16,
                radius: 1 / 8,
                fill,
                children: [
                    new Text({
                        x: 1 / 16,
                        y: 0 / 2,
                        width: 14 / 16,
                        height: 1 / 2,
                        size: 5 / 10,
                        color: colors.WHITE,
                        align: "left",
                        baseline: "bottom",
                        font: "ComicNueue Angular",
                        weight: "bold",
                        content: name
                    }),
                    new Text({
                        x: 1 / 16,
                        y: 1 / 2,
                        width: 14 / 16,
                        height: 1 / 2,
                        size: 6 / 20,
                        color: colors.WHITE,
                        align: "left",
                        baseline: "top",
                        font: "ComicNueue Angular",
                        content: description
                    }),
                    highscoreText = new Text({
                        x: 1 / 16,
                        y: 0,
                        width: 14 / 16,
                        height: 1,
                        size: 4 / 10,
                        color: colors.WHITE,
                        align: "right",
                        weight: "bold",
                        font: "ComicNueue Angular"
                    })
                ]
            }),
            async oninteractup() {
                sfx.CLICK.play();
                await end$1();
                startGame(highscoreKey, difficulties[difficultyKey]);
            }
        }));
        highscore[highscoreKey] = highscoreText;
    });
    function start$2() {
        box.addTo(safeArea);
        for (let name in highscore) highscore[name].content = `${storage$1.getItem(name)}`;
        box.setBound({
            x: 1,
            y: 1 / 5,
            width: 1,
            height: 4 / 5
        });
        box.animateBound({
            x: 0,
            y: 1 / 5,
            width: 1,
            height: 4 / 5
        }, 400, expoOut);
    }
    async function end$1() {
        await box.animateBound({
            x: -1,
            y: 1 / 5,
            width: 1,
            height: 4 / 5
        }, 200, sineIn);
        box.remove();
    }

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
                    [0, 1],
                    [3 / 4, 0],
                    [1, 0],
                    [1 / 4, 1]
                ],
                opacity: 1 / 4,
                fill: colors.WHITE,
                operation: "source-atop"
            })
        ]
    });
    let buttonLine = new Color;
    let buttonFill = new Color;
    let buttonColor = new Color;
    let startButton = new RoundedRectangle({
        fill: buttonFill,
        line: buttonLine,
        dash: [4, 4],
        dashSpeed: 4 / 1000,
        updateThickness,
        radius: 0.5,
        cap: "flat",
        join: "miter",
        child: new Text({
            x: 0,
            y: 0,
            width: 1,
            height: 1,
            weight: "bold",
            font: "ComicNueue Angular",
            color: buttonColor,
            size: 6 / 10,
            content: "simulan"
        }),
        async oninteractup() {
            sfx.CLICK.play();
            await end$2();
            start$2();
        }
    });
    let bulb;
    let settings = new Object2D({
        children: [
            new Object2D({
                x: 0,
                y: 0,
                width: 1 / 6,
                height: 1,
                child: bulb = new Image$1({
                    x: 1 / 6,
                    y: 1 / 6,
                    width: 4 / 6,
                    height: 4 / 6
                }),
                oninteractup() {
                    setTheme(exports.theme === "dark" ? "light" : "dark");
                    updateColor();
                }
            })
        ]
    });
    let titleBoxPos = updateBoundWrapper({
        x: 1 / 12,
        y: 0 / 20,
        width: 10 / 12,
        height: 14 / 20
    });
    function updateColor() {
        if (exports.theme === "dark") {
            buttonLine.setColor(colors.PH_YELLOW);
            buttonFill.setColor(colors.BACKGROUND);
            buttonColor.setColor(colors.PH_YELLOW);
            title.source = images.TITLE_DARK_PNG;
        } else {
            buttonLine.setColor(colors.FOREGROUND);
            buttonFill.setColor(colors.PH_YELLOW);
            buttonColor.setColor(colors.BLACK);
            title.source = images.TITLE_PNG;
        }
    }
    let intervalID = -1;
    function start$3() {
        updateColor();
        bulb.source = images.BULB_PNG;
        titleBox.setBound({
            x: 1 / 12,
            y: -16 / 20,
            width: 10 / 12,
            height: 14 / 20,
        });
        titleBox.addTo(safeArea);
        let startTime = now$1();
        titleBox.animateUpdateBound(function () {
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
            }, 700, linear);
        }, 4000);
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
        settings.setOpacity(0);
        settings.animateOpacity(1, 400);
        settings.setBound({
            x: 0 / 6,
            y: 0 / 10,
            width: 6 / 6,
            height: 1 / 10,
        });
        settings.addTo(safeArea);
    }
    async function end$2() {
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
        settings.animateOpacity(0, 200).then(() => {
            settings.remove();
        });
        clearInterval(intervalID);
        await timeout(200);
    }

    let loading = new Horizontal({
        cap: "flat",
        join: "miter",
        line: colors.FOREGROUND,
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
            fill: colors.BACKGROUND,
            operation: "destination-over"
        })
    });
    let safeArea = new SafeArea({
        ratio: 3 / 5,
        parent: scene
    });
    function updateThickness() {
        this.thickness = safeArea.width / 100;
    }function setTheme(currentTheme) {
        storage$1.setItem("theme", currentTheme);
        if (currentTheme == "dark") {
            document.body.style.backgroundColor = "black";
            exports.theme = "dark";
            colors.BACKGROUND.setColor("#222");
            colors.FOREGROUND.setColor(colors.WHITE);
            colors.ACCENT.setColor(colors.SKY_BLUE);
        } else {
            document.body.style.backgroundColor = "white";
            exports.theme = "light";
            colors.BACKGROUND.setColor(colors.WHITE);
            colors.FOREGROUND.setColor(colors.BLACK);
            colors.ACCENT.setColor(colors.PH_BLUE);
        }
    }
    storage$1.setAllDefault({
        theme: "light",
        highscore_easy: 0,
        highscore_medium: 0,
        highscore_hard: 0,
        highscore_veryHard: 0
    });
    setTheme(storage$1.getItem("theme"));
    load(assets).then(() => {
        start$3();
    });

    exports.canvas = canvas;
    exports.safeArea = safeArea;
    exports.scene = scene;
    exports.setTheme = setTheme;
    exports.updateThickness = updateThickness;

    return exports;

}({}));
