import {
    safeArea,
    updateThickness
} from "../main.js";
import Horizontal from "../2d/shape/horizontal.js";
import {
    sineIn,
    sineOut
} from "../2d/easing.js";
import {
    colors
} from "../asset.js";
let loading = new Horizontal({
    cap: "flat",
    join: "miter",
    line: colors.FOREGROUND,
    dash: [4, 4],
    dashSpeed: 1 / 100,
    updateThickness,
});
export default async function load(promise) {
    loading.addTo(safeArea);
    loading.setBound({
        x: 2 / 6,
        y: 10 / 10,
        width: 2 / 6,
        height: 2 / 10,
    });
    await loading.animateBound({
        x: 2 / 6,
        y: 8 / 10,
        width: 2 / 6,
        height: 2 / 10
    }, 200, sineOut);
    await promise;
    await loading.animateBound({
        x: 2 / 6,
        y: 10 / 10,
        width: 2 / 6,
        height: 2 / 10
    }, 200, sineIn);
    loading.remove();
}
