import { Horizontal } from "../graphics/shape/horizontal";
import { safeArea } from "./master";
import { updateThickness } from "./update_thickness";
import { foreground } from "../asset/color";

export const loadingLine = new Horizontal({
    cap: "butt",
    join: "miter",
    line: foreground,
    dash: [4, 4],
    dashSpeed: 1 / 100,
    updateThickness,
    entranceParent: safeArea,
    enterOption: {
        x: 2 / 6,
        y: 8 / 10,
        width: 2 / 6,
        height: 2 / 10,
    },
    exitOption: {
        x: 2 / 6,
        y: 10 / 10,
        width: 2 / 6,
        height: 2 / 10,
    },
});
