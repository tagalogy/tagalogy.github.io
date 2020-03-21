import {Base} from "./base";

export class Rectangle extends Base {
    draw(context: CanvasRenderingContext2D, drawChildren = true): void {
        if (!this.visible) return;
        super.draw(context, false);
        this.updateBound();
        const {x, y, width, height} = this;
        context.fillRect(x, y, width, height);
        context.strokeRect(x, y, width, height);
        if (drawChildren) this.drawChildren(context);
    }
}