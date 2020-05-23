import {Object2d, Object2dOption} from "../object_2d";

export interface ImageOption extends Object2dOption {
    source?: HTMLImageElement;
    imageScaling?: "fit" | "fill";
}
export class Image extends Object2d {
    source?: HTMLImageElement;
    imageScaling: "fit" | "fill";
    constructor(option: ImageOption = {}) {
        super(option);
        this.source = option.source;
        const {imageScaling} = option;
        this.imageScaling = imageScaling ?? "fit";
    }
    draw(context: CanvasRenderingContext2D, drawChildren = true): void {
        if (!this.visible) return;
        super.draw(context, false);
        this.updateBound();
        const {source, imageScaling} = this;
        if (!source) return;
        const {
            naturalWidth: rawSrcWidth,
            naturalHeight: rawSrcHeight,
        } = source;
        const {
            x,
            y,
            width: rawDestWidth,
            height: rawDestHeight,
        } = this;
        if (imageScaling === "fit") {
            const scaleX = rawDestWidth / rawSrcWidth;
            const scaleY = rawDestHeight / rawSrcHeight;
            const scale = Math.min(scaleX, scaleY);
            const width = scale * rawSrcWidth;
            const height = scale * rawSrcHeight;
            context.drawImage(source, x + (rawDestWidth - width) / 2, y + (rawDestHeight - height) / 2, width, height);
        } else if (imageScaling === "fill") {
            // TODO
        }
        if (drawChildren) this.drawChildren(context);
    }
}
