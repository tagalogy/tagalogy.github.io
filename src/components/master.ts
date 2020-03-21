import {SafeArea} from "../graphics/safearea";
import {Scene} from "../graphics/scene";
import {Rectangle} from "../graphics/shape/rectangle";
import {background} from "../asset/color";

export const canvas = document.querySelector("canvas")!;
export const scene = new Scene({
    canvas,
    autoresize: true,
});
new Rectangle({
    x: 0,
    y: 0,
    width: 1,
    height: 1,
    z: 2,
    fill: background,
    operation: "destination-over",
    parent: scene,
})
export const safeArea = new SafeArea({
    ratio: 3 / 5,
    parent: scene,
});
