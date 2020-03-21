import {noop} from "../../utils/noop";
import {Color} from "../color";
import {Object2D, Object2DOption} from "../object2d";

export interface TextUpdater {
    (this: Text): void;
}
export interface TextOption extends Object2DOption {
    updateSize?: TextUpdater;
    size?: number;
    isSizeRelative?: boolean;
    style?: "" | "italics";
    weight?: "" | "bold";
    font?: string | string[];
    color?: string | Color;
    wrap?: boolean;
    align?: "left" | "center" | "right";
    baseline?: "top" | "middle" | "bottom";
    content?: string;
}
export class Text extends Object2D {
    content: string;
    style: "" | "italics";
    weight: "" | "bold";
    font: string | string[];
    align: "left" | "center" | "right";
    baseline: "top" | "middle" | "bottom";
    wrap: boolean;
    color: Color;
    updateSize: TextUpdater = noop;
    size = 10;
    constructor(option: TextOption = {}) {
        super(option);
        const {style, weight, font, color, wrap, align, baseline, content} = option;
        this.content = content ?? "";
        this.style = style ?? "";
        this.weight = weight ?? "";
        this.font = font ?? "sans-serif";
        this.align = align ?? "center";
        this.baseline = baseline ?? "middle";
        this.wrap = wrap ?? false;
        this.color = color instanceof Color ? color : new Color(color ?? "#000");
        this.setSize(option);
    }
    setSize(option: number | TextOption): void {
        this.updateSize = updateSizeWrapper(option);
    }
    draw(context: CanvasRenderingContext2D, drawChildren = true): void {
        if (!this.visible) return;
        super.draw(context, false);
        context.fillStyle = this.color.getString();
        this.updateSize();
        let {content, size, style, weight, font, wrap, align, baseline} = this;
        context.textAlign = align;
        context.textBaseline = baseline;
        if (typeof font === "string") font = [font];
        font = font.map(font => `"${font}"`);
        context.font = `${style} ${weight} ${size}px ${font.join(" ")}`;
        this.updateBound();
        const {x, y, width, height} = this;
        let mainX;
        switch (align) {
            case "left": mainX = x; break;
            case "center": mainX = x + width / 2; break;
            case "right": mainX = x + width; break;
        }
        let mainY;
        switch (baseline) {
            case "top": mainY = y; break;
            case "middle": mainY = y + height / 2; break;
            case "bottom": mainY = y + height; break;
        }
        if (wrap) {
            const lines = getLines(context, content, width);
            const len = lines.length;
            switch (baseline) {
                case "middle": mainY -= len * size / 2; break;
                case "bottom": mainY -= len * size; break;
            }
            for (let ind = 0; ind < len; ind++) context.fillText(lines[ind], mainX, mainY + size * ind);
        } else {
            context.fillText(content, mainX, mainY);
        }
        if (drawChildren) this.drawChildren(context);
    }
}
export function updateSizeWrapper(option: number | TextOption): TextUpdater {
    if (typeof option === "number") {
        return function () {
            this.size = option;
        };
    }
    const {updateSize} = option;
    if (updateSize) return updateSize;
    const {
        size = 10,
        isSizeRelative = true
    } = option;
    return function () {
        if (isSizeRelative) {
            this.size = size * this.height;
        } else {
            this.size = size;
        }
    };
}
const NEWLINES = /\r\n|\r|\n/;
const SPACES = /\s+/;
export function getLines(context: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const lines: string[] = [];
    for (const paragraph of text.trim().split(NEWLINES)) {
        const words = paragraph.trim().split(SPACES);
        let [currentLine, ...nextLine] = words;
        for (const word of nextLine) {
            let currentWord = `${currentLine} ${word}`;
            const {width} = context.measureText(currentWord);
            if (width < maxWidth) {
                currentLine = currentWord;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
    }
    return lines;
}