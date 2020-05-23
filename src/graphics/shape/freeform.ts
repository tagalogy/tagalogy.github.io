import {Base, BaseOption} from "./base";

export interface FreeFormOption extends BaseOption {
    path?: [number, number][];
}
export class FreeForm extends Base {
    // private coordsAnimId = -1;
    path: [number, number][];
    constructor(option: FreeFormOption = {}) {
        super(option);
        this.path = option.path ?? [];
    }
    draw(context: CanvasRenderingContext2D, drawChildren = true): void {
        if (!this.visible) return;
        super.draw(context, false);
        this.updateBound();
        const {x, y, width, height, path} = this;
        context.beginPath();
        if (path.length > 0) {
            const [first, ...rest] = path;
            context.moveTo(x + first[0] * width, y + first[1] * height);
            for (const [pointX, pointY] of rest) {
                context.lineTo(x + pointX * width, y + pointY * height);
            }
            context.closePath();
            context.fill();
            context.stroke();
        }
        if (drawChildren) this.drawChildren(context);
    }
}