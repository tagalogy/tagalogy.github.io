import Object2D from "../2d/object2d.js";
import Rectangle from "../2d/shape/rectangle.js";
import RoundedRectangle from "../2d/shape/rounded_rectangle.js";
import {
    scene,
    safeArea,
    updateThickness
} from "../main.js";
import {
    colors
} from "../asset.js";
let dialogBox;
let dialog = new Rectangle({
    updateBound: scene.updateBound,
    fill: colors.BLACK,
    opacity: 1 / 2,
    z: 2,
    child: new Object2D({
        updateBound: safeArea.updateBound,
        isOpacityRelative: false,
        opacity: 1,
        child: dialogBox = new RoundedRectangle({
            x: 1 / 6,
            y: 3 / 10,
            width: 4 / 6,
            height: 4 / 10,
            fill: colors.WHITE,
            line: colors.PH_RED,
            updateThickness,
            radius: 1 / 6
        })
    })
});
export function alert(msg) {

}
export function confirm(msg) {

}
