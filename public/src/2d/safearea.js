import Object2D from "./object2d.js";
let min = Math.min;
export default class SafeArea extends Object2D {
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
