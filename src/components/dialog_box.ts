import { Color } from "../graphics/color";
import { Object2d } from "../graphics/object_2d";
import { SafeArea } from "../graphics/safearea";
import { Rectangle } from "../graphics/shape/rectangle";
import { RoundedRectangle } from "../graphics/shape/rounded_rectangle";
import { Text } from "../graphics/shape/text";
import { scene } from "./master";
import { background, white, foreground } from "../asset/color";

export const dialogScreen = new Rectangle({
    x: 0,
    y: 0,
    width: 1,
    height: 1,
    fill: new Color({
        red: 0,
        green: 0,
        blue: 0,
        alpha: 0.5,
    }),
    entranceParent: scene,
});
const safeArea = new SafeArea({
    ratio: 3 / 5,
    opacity: 1,
    parent: dialogScreen,
});
export const dialogBox = new RoundedRectangle({
    fill: background,
    radius: 1 / 16,
    entranceParent: safeArea,
    enterOption: {
        x: 1 / 6,
        y: 3 / 10,
        width: 4 / 6,
        height: 4 / 10,
    },
    exitOption: {
        x: 1 / 6,
        y: 10 / 10,
        width: 4 / 6,
        height: 4 / 10,
    },
});
export let buttonPlace = new Object2d({
    x: 0 / 8,
    y: 6 / 8,
    width: 8 / 8,
    height: 2 / 8,
    parent: dialogBox,
});
export const cancelFill = new Color();
export const cancelColor = new Color();
export const okFill = new Color();
export const okColor = new Color(white);
export const msgText = new Text({
    x: 1 / 8,
    y: 0 / 8,
    width: 6 / 8,
    height: 6 / 8,
    wrap: true,
    align: "left",
    baseline: "middle",
    font: "ComicNeue Angular",
    size: 1 / 9,
    color: foreground,
    parent: dialogBox,
});
export const cancelBox = new RoundedRectangle({
    x: 0,
    y: 0,
    width: 1 / 2,
    height: 1,
    radius: 1 / 4,
    fill: cancelFill,
    parent: buttonPlace,
});
export const cancelText = new Text({
    x: 0,
    y: 0,
    width: 1,
    height: 1,
    size: 4 / 10,
    color: cancelColor,
    font: "ComicNeue Angular",
    weight: "bold",
    parent: cancelBox,
});
export const okBox = new RoundedRectangle({
    x: 1 / 2,
    y: 0,
    width: 1 / 2,
    height: 1,
    radius: 1 / 4,
    fill: okFill,
    parent: buttonPlace,
});
export const okText = new Text({
    x: 0,
    y: 0,
    width: 1,
    height: 1,
    size: 4 / 10,
    color: okColor,
    font: "ComicNeue Angular",
    weight: "bold",
    parent: okBox,
});
