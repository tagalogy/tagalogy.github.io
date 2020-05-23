import {Object2d, Object2dOption} from "./object_2d";

interface SafeAreaOption extends Object2dOption {
    ratio: number;
}
export class SafeArea extends Object2d {
    constructor(option: SafeAreaOption) {
        super(option);
        const {ratio} = option;
        this.updateBound = function () {
            const {parent} = this;
            if (!parent) return;
            const {x, y, width, height} = parent;
            const scale = Math.min(width / ratio, height);
            const finalWidth = scale * ratio;
            this.x = x + (width - finalWidth) / 2;
            this.y = y + (height - scale) / 2;
            this.width = finalWidth;
            this.height = scale;
        };
    }
}
