import Object2D from "../2d/object2d.js";
import Rectangle from "../2d/shape/rectangle.js";
import RoundedRectangle from "../2d/shape/rounded_rectangle.js";
import SafeArea from "../2d/safearea.js";
import {
    scene,
    updateThickness
} from "../main.js";
import {
    colors
} from "../asset.js";
let dialogBox;
let dialog = new Rectangle({
    x: 0,
    y: 0,
    width: 1,
    height: 1,
    fill: colors.BLACK,
    z: 2,
    child: new SafeArea({
        ratio: 3 / 5,
        isOpacityRelative: false,
        opacity: 1,
        child: dialogBox = new RoundedRectangle({
            fill: colors.WHITE,
            radius: 1 / 6
        })
    })
});
export function alert(msg) {

}
export function confirm(msg) {

}
