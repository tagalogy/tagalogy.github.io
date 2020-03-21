import {noop} from "../../utils/noop";
import {now, timeout} from "../../utils/time";
import {alphaToRange, EasingFunction, sine} from "../easing";
import {Base, BaseOption} from "./base";

declare function setTimeout(callback: () => void, delay: number): number;
declare function clearTimeout(id: number): void;

export interface LineUpdater {
    (this: Line): void;
}
export interface LineOption extends BaseOption {
    x0?: number;
    y0?: number;
    x1?: number;
    y1?: number;

    updateCoords?: LineUpdater;
}
export class Line extends Base {
    coordsAnimID = -1;
    x0 = 0;
    y0 = 0;
    x1 = 0;
    y1 = 0;

    updateCoords: LineUpdater = noop;

    constructor(option: LineOption = {}) {
        super(option);
        this.setCoords(option);
    }
    setCoords(option: LineOption): void {
        this.updateCoords = updateCoordsWrapper(option);
    }
    async animateCoords(option: LineOption, time?: number, easing?: EasingFunction): Promise<void> {
        await this.animateUpdateCoords(updateCoordsWrapper(option), time, easing);
    }
    async animateUpdateCoords(updateCoords: LineUpdater, time = 400, easing = sine): Promise<void> {
        clearTimeout(this.coordsAnimID);
        const oldUpdateCoords = this.updateCoords;
        const startTime = now();
        this.updateCoords = function () {
            const alpha = easing((now() - startTime) / time);
            oldUpdateCoords.call(this);
            const {
                x0: oldX0,
                y0: oldY0,
                x1: oldX1,
                y1: oldY1,
            } = this;
            updateCoords.call(this);
            const {
                x0: newX0,
                y0: newY0,
                x1: newX1,
                y1: newY1,
            } = this;
            this.x0 = alphaToRange(alpha, oldX0, newX0)
            this.y0 = alphaToRange(alpha, oldY0, newY0)
            this.x1 = alphaToRange(alpha, oldX1, newX1)
            this.y1 = alphaToRange(alpha, oldY1, newY1)
        };
        this.coordsAnimID = setTimeout(() => {
            this.updateCoords = updateCoords;
        }, time);
        await timeout(time);
    }
    draw(context: CanvasRenderingContext2D, drawChildren = true): void {
        if (!this.visible) return;
        super.draw(context, false);
        this.updateCoords();
        const {x0, y0, x1, y1} = this;
        context.beginPath();
        context.moveTo(x0, y0);
        context.lineTo(x1, y1);
        context.stroke();
        if (drawChildren) this.drawChildren(context);
    }
}
export function updateCoordsWrapper(option: LineOption): LineUpdater {
    const {updateCoords} = option;
    if (updateCoords) return updateCoords;
    const {
        x0 = 0,
        y0 = 0,
        x1 = 0,
        y1 = 0,
    } = option;
    return function () {
        this.updateBound();
        const {x, y, width, height} = this;
        this.x0 = x + width * x0;
        this.y0 = y + height * y0;
        this.x1 = x + width * x1;
        this.y1 = y + height * y1;
    };
}