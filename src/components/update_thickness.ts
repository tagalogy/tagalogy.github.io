import {Base} from "../graphics/shape/base";
import {safeArea} from "./master";

export function updateThickness(this: Base): void {
    this.thickness = safeArea.width / 100;
}