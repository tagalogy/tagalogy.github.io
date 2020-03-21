import {Line, LineOption} from "./line";

export class Horizontal extends Line {
    constructor(option: LineOption = {}) {
        super(option);
        this.setCoords({
            x0: 0,
            y0: 1 / 2,
            x1: 1,
            y1: 1 / 2,
        });
    }
}