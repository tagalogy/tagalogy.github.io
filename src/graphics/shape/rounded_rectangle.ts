import { noop } from "../../utils/noop";
import { Base, BaseOption } from "./base";

export interface RoundedRectangleUpdater {
    (this: RoundedRectangle): void;
}
export interface RoundedRectangleOption extends BaseOption {
    updateRadius?: RoundedRectangleUpdater;
    radius?: number;
    isRadiusRelative?: boolean;
}
export class RoundedRectangle extends Base {
    updateRadius: RoundedRectangleUpdater = noop;
    radius = 0;
    constructor(option: RoundedRectangleOption = {}) {
        super(option);
        this.setRadius(option);
    }
    setRadius(option: RoundedRectangleOption): void {
        this.updateRadius = updateRadiusWrapper(option);
    }
    draw(context: CanvasRenderingContext2D, drawChildren = true): void {
        if (!this.visible) return;
        super.draw(context, false);
        this.updateBound();
        this.updateRadius();
        const { radius, x: minX, y: minY, width, height } = this;
        const midX = minX + width / 2;
        const midY = minY + height / 2;
        const maxX = minX + width;
        const maxY = minY + height;
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
export function updateRadiusWrapper(
    option: number | RoundedRectangleOption,
): RoundedRectangleUpdater {
    if (typeof option === "number") {
        return function () {
            this.radius = option;
        };
    }
    const { updateRadius } = option;
    if (updateRadius) return updateRadius;
    const { radius = 0, isRadiusRelative = true } = option;
    return function () {
        if (isRadiusRelative) {
            const { width, height } = this;
            this.radius = Math.min(width, height) * radius;
        } else {
            this.radius = radius;
        }
    };
}
