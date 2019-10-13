import Base from "./base.js";
export default class Circle extends Base {
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
        let radius = Math.min(width, height) / 2;
        context.beginPath();
        context.arc(x + width / 2, y + height / 2, radius, 0, 2 * Math.PI);
        context.closePath();
        context.fill();
        context.stroke();
        if(drawChildren) this.drawChildren();
    }
}