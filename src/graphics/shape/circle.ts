import {Base} from "./base";

export class Circle extends Base {
    draw(context: CanvasRenderingContext2D, drawChildren = true) {
        if (!this.visible) return;
        super.draw(context, false);
        this.updateBound();
        const {x, y, width, height} = this;
        const radius = Math.min(width, height) / 2;
        context.beginPath();
        context.arc(x + width / 2, y + height / 2, radius, 0, 2 * Math.PI);
        context.closePath();
        context.fill();
        context.stroke();
        if (drawChildren) this.drawChildren(context);
    }
}