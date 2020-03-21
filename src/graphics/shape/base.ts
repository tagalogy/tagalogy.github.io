import {noop} from "../../utils/noop";
import {now} from "../../utils/time";
import {Color} from "../color";
import {Object2D, Object2DOption} from "../object2d";

export interface BaseUpdater {
    (this: Base): void;
}
export interface BaseOption extends Object2DOption {
    fill?: string | Color;
    line?: string | Color;

    cap?: "butt" | "round" | "square";
    join?: "miter" | "round" | "bevel";

    dash?: number[];
    dashSpeed?: number;
    thickness?: number;
    updateThickness?: BaseUpdater;
}
export class Base extends Object2D {
    private _dashSpeed = 0;
    private _dash: number[] = [];

    thickness = 0;

    fill: Color;
    line: Color;
    cap: "butt" | "round" | "square";
    join: "miter" | "round" | "bevel";
    dashStartOffset = 0;
    dashStartTime = now();
    updateThickness: BaseUpdater = noop;
    dashSum = 0;

    constructor(option: BaseOption = {}) {
        super(option);
        const {fill, line, cap, join, dash, dashSpeed} = option;
        this.fill = fill instanceof Color ? fill : new Color(fill ?? "#0000");
        this.line = line instanceof Color ? line : new Color(line ?? "#0000");
        this.cap = cap ?? "butt";
        this.join = join ?? "miter";
        this.dash = dash ?? [];
        this.dashSpeed = dashSpeed ?? 0;
        this.setThickness(option);
    }
    setThickness(option: number | Object2DOption): void {
        this.updateThickness = updateThicknessWrapper(option);
    }
    get dash(): number[] {
        return this._dash;
    }
    set dash(dash) {
        this._dash = dash;
        let sum = 0;
        for (const num of dash) sum += num;
        this.dashSum = sum;
    }
    get dashSpeed(): number {
        return this._dashSpeed;
    }
    set dashSpeed(dashSpeed) {
        this._dashSpeed = dashSpeed;
        this.dashStartOffset = this.getDashOffset();
        this.dashStartTime = now();
    }
    private getDashOffset(): number {
        return ((now() - this.dashStartTime) * this._dashSpeed + this.dashStartOffset) % this.dashSum;
    }
    draw(context: CanvasRenderingContext2D, drawChildren = true): void {
        if (!this.visible) return;
        super.draw(context, false);
        this.updateThickness();
        const {fill, line, cap, join, thickness, dash} = this;
        context.fillStyle = fill.getString();
        context.strokeStyle = line.getString();
        context.lineCap = cap;
        context.lineJoin = join;
        context.lineWidth = thickness;
        context.setLineDash(dash.map(num => num * thickness));
        context.lineDashOffset = this.getDashOffset() * thickness;
        if (drawChildren) this.drawChildren(context);
    }
}
export function updateThicknessWrapper(option: number | BaseOption): BaseUpdater {
    if (typeof option === "number") {
        return function () {
            this.thickness = option;
        };
    }
    const {updateThickness} = option;
    if (updateThickness) return updateThickness;
    const {thickness = 2} = option;
    return function () {
        this.thickness = thickness;
    };
}
