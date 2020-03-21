import {EventTarget, EventTargetOption} from "../event/event";
import {noop} from "../utils/noop";
import {now, timeout} from "../utils/time";
import {alphaToRange, EasingFunction, expoOut, sine, sineIn} from "./easing";
import {Scene} from "./scene";

declare function setTimeout(callback: () => void, delay: number): number;
declare function clearTimeout(id: number): void;

export interface Object2DUpdater {
    (this: Object2D): void;
}
export interface Object2DOption extends EventTargetOption {
    z?: number;

    x?: number;
    y?: number;
    isPositionRelative?: boolean;

    width?: number;
    height?: number;
    isScaleRelative?: boolean;

    opacity?: number;
    isOpacityRelative?: boolean;

    parent?: Object2D;

    operation?: "source-over" | "source-in" | "source-out" | "source-atop" |
    "destination-over" | "destination-in" | "destination-out" | "destination-atop" |
    "lighter" | "copy" | "xor" | "multiply" | "screen" | "overlay" | "darken" | "lighten" |
    "color-dodge" | "color-burn" | "hard-light" | "soft-light" | "difference" | "exclusion" |
    "hue" | "saturation" | "color" | "luminousity";

    entranceParent?: Object2D;

    exitOption?: Object2DOption;
    enterOption?: Object2DOption;

    updateBound?: Object2DUpdater;
    updateOpacity?: Object2DUpdater;
}
export class Object2D extends EventTarget {
    private _z = 0;
    private boundAnimID = -1;
    private opacityAnimID = -1;

    visible = true;
    opacity = 1;

    x = 0;
    y = 0;
    width = 0;
    height = 0;

    children: Object2D[] = [];
    parent: null | Object2D = null;
    scene: null | Scene = null;
    operation: string;
    updateBound: Object2DUpdater = noop;
    updateOpacity: Object2DUpdater = noop;

    entranceParent: null | Object2D;

    enterOption: null | Object2DOption;
    exitOption: null | Object2DOption;

    constructor(option: Object2DOption = {}) {
        super(option);
        this.setOpacity(option);
        this.setBound(option);
        this.z = option.z ?? 0;
        this.operation = option.operation ?? "source-over";
        this.entranceParent = option.entranceParent ?? null;
        this.enterOption = option.enterOption ?? null;
        this.exitOption = option.exitOption ?? null;
        const {parent} = option;
        if (parent) this.addTo(parent);
        /*
        if (child) this.addChild(child);
        if (children) this.addChildren(children);
        */
    }
    get z(): number {
        return this._z;
    }
    set z(num) {
        this._z = num;
        const {parent} = this;
        if (parent) parent.updateDrawOrder();
    }
    setBound(option: Object2DOption): void {
        this.updateBound = updateBoundWrapper(option);
    }
    async animateBound(option: Object2DOption, time?: number, easing?: EasingFunction): Promise<void> {
        await this.animateUpdateBound(updateBoundWrapper(option), time, easing);
    }
    async animateUpdateBound(updateBound: Object2DUpdater, time = 400, easing = sine): Promise<void> {
        clearTimeout(this.boundAnimID);
        const oldUpdateBound = this.updateBound;
        const startTime = now();
        this.updateBound = function () {
            const alpha = easing((now() - startTime) / time);
            oldUpdateBound.call(this);
            const {
                x: oldX,
                y: oldY,
                width: oldWidth,
                height: oldHeight,
            } = this;
            updateBound.call(this);
            const {
                x: newX,
                y: newY,
                width: newWidth,
                height: newHeight,
            } = this;
            this.x = alphaToRange(alpha, oldX, newX);
            this.y = alphaToRange(alpha, oldY, newY);
            this.width = alphaToRange(alpha, oldWidth, newWidth);
            this.height = alphaToRange(alpha, oldHeight, newHeight);
        };
        this.boundAnimID = setTimeout(() => {
            this.updateBound = updateBound;
        }, time);
        await timeout(time);
    }
    setOpacity(option: number | Object2DOption): void {
        this.updateOpacity = updateOpacityWrapper(option);
    }
    async animateOpacity(option: number | Object2DOption, time?: number, easing?: EasingFunction): Promise<void> {
        await this.animateUpdateOpacity(updateOpacityWrapper(option), time, easing);
    }
    async animateUpdateOpacity(updateOpacity: Object2DUpdater, time = 400, easing = sine): Promise<void> {
        clearTimeout(this.opacityAnimID);
        const oldUpdateOpacity = this.updateOpacity;
        const startTime = now();
        this.updateOpacity = function () {
            const alpha = easing((now() - startTime) / time);
            oldUpdateOpacity.call(this);
            const {opacity: oldOpacity} = this;
            updateOpacity.call(this);
            const {opacity: newOpacity} = this;
            this.opacity = alphaToRange(alpha, oldOpacity, newOpacity);
        };
        this.opacityAnimID = setTimeout(() => {
            this.updateOpacity = updateOpacity;
        }, time);
        await timeout(time);
    }
    async fadeIn(): Promise<void> {
        const {entranceParent} = this;
        if (!entranceParent) return;
        this.addTo(entranceParent);
        this.setOpacity(0);
        await this.animateOpacity(1, 400);
    }
    async fadeOut(): Promise<void> {
        await this.animateOpacity(0, 200);
        this.remove();
    }
    async enter(): Promise<void> {
        const {entranceParent, enterOption, exitOption} = this;
        if (!(entranceParent && enterOption && exitOption)) return;
        this.addTo(entranceParent);
        this.setBound(exitOption);
        await this.animateBound(enterOption, 400, expoOut);
    }
    async exit(): Promise<void> {
        const {exitOption} = this;
        if (!exitOption) return;
        await this.animateBound(exitOption, 200, sineIn);
        this.remove();
    }
    forEachDescendant(callback: (object2D: Object2D) => void, includeThis = false): void {
        if (includeThis) callback(this);
        for (const child of this.children) child.forEachDescendant(callback, true);
    }
    updateDrawOrder(deep = false): void {
        const {children} = this;
        children.sort((a, b) => a.z - b.z);
        if (deep) for (const child of children) child.updateDrawOrder(true);
    }
    draw(context: CanvasRenderingContext2D, drawChildren = true): void {
        if (!this.visible) return;
        this.updateOpacity();
        context.globalAlpha = this.opacity;
        context.globalCompositeOperation = this.operation;
        if (drawChildren) this.drawChildren(context);
    }
    drawChildren(context: CanvasRenderingContext2D): void {
        for (const child of this.children) child.draw(context);
    }
    setscene(scene: null | Scene): void {
        this.scene = scene;
        for (const child of this.children) child.setscene(scene);
    }
    addChild(child: Object2D, updateDrawOrder = true): void {
        // if (child instanceof Scene) throw new Error("Unable to add scene as a child");
        child.invoke("beforeadd");
        child.remove(false);
        child.parent = this;
        child.setscene(this.scene);
        this.children.push(child);
        if (updateDrawOrder) this.updateDrawOrder();
        child.invoke("afteradd");
    }
    addChildren(children: Object2D[], updateDrawOrder = true): void {
        for (const child of children) this.addChild(child, false);
        if (updateDrawOrder) this.updateDrawOrder();
    }
    addTo(parent: Object2D, updateDrawOrder = true): void {
        parent.addChild(this, updateDrawOrder);
    }
    removeChild(child: Object2D, setscene = true): void {
        if (child.parent !== this) return;
        child.invoke("beforeremove");
        child.parent = null;
        if (setscene) child.setscene(null);
        const {children} = this;
        children.splice(children.indexOf(child), 1);
        child.invoke("afterremove");
    }
    remove(setscene = true): void {
        const {parent} = this;
        if (parent) parent.removeChild(this, setscene);
    }
    removeChildren(children: Object2D[]): void {
        for (const child of children) this.removeChild(child);
    }
    removeAllChildren(): void {
        this.removeChildren([...this.children]);
    }
    hitTest(testX: number, testY: number): boolean {
        this.updateBound();
        const {x, y, width, height} = this;
        return testX > x && testY > y && testX < x + width && testY < y + height;
    }
}
export function updateBoundWrapper(option: Object2DOption): Object2DUpdater {
    const {updateBound} = option;
    if (updateBound) return updateBound;
    const {
        x = 0,
        y = 0,
        width = 0,
        height = 0,
        isPositionRelative = true,
        isScaleRelative = true,
    } = option;
    return function () {
        const {parent} = this;
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
        this.y = offsetY + offsetHeight * y;
        this.width = offsetWidth * width;
        this.height = offsetHeight * height;
    };
}
export function updateOpacityWrapper(option: number | Object2DOption): Object2DUpdater {
    if (typeof option === "number") {
        option = {opacity: option};
    }
    const {updateOpacity} = option;
    if (updateOpacity) return updateOpacity;
    const {
        opacity = 1,
        isOpacityRelative = true,
    } = option;
    return function () {
        const {parent} = this;
        if (parent && isOpacityRelative) {
            parent.updateOpacity();
            this.opacity = opacity * parent.opacity;
        } else {
            this.opacity = opacity;
        }
    };
}