import {Color} from "../graphics/color";
import {Object2D} from "../graphics/object2d";
import {Horizontal} from "../graphics/shape/horizontal";
import {Rectangle} from "../graphics/shape/rectangle";
import {RoundedRectangle} from "../graphics/shape/rounded_rectangle";
import {Text} from "../graphics/shape/text";
import {safeArea} from "./master";
import {updateThickness} from "./update_thickness";
import {foreground, yellowPH, black} from "../asset/color";

export const hudBox = new Object2D({
    entranceParent: safeArea,
    enterOption: {
        x: 0 / 3,
        y: 0 / 5,
        width: 3 / 3,
        height: 1 / 5,
    },
    exitOption: {
        x: 0 / 3,
        y: - 1 / 5,
        width: 3 / 3,
        height: 1 / 5,
    },
});
export const timerColor = new Color;
export const pauseColor = new Color;
export const horizontalLine = new Horizontal({
    x: 0,
    y: 1,
    width: 1,
    height: 0,
    line: foreground,
    dash: [4, 4],
    dashSpeed: 2 / 1000,
    updateThickness,
    parent: hudBox,
});
export const scoreBox = new Object2D({
    x: 1 / 3,
    y: 0 / 1,
    width: 1 / 3,
    height: 1 / 1,
    parent: hudBox,
});
let scoreShape = new RoundedRectangle({
    x: 2 / 10,
    y: 2 / 10,
    width: 6 / 10,
    height: 6 / 10,
    fill: yellowPH,
    radius: 2 / 10,
    parent: scoreBox,
});
export const scoreText = new Text({
    x: 0,
    y: 0,
    width: 1,
    height: 1,
    weight: "bold",
    font: "ComicNeue Angular",
    color: black,
    size: 6 / 10,
    content: "0",
    parent: scoreShape,
});
export const pauseButton = new Object2D({
    x: 0 / 3,
    y: 0 / 1,
    width: 1 / 3,
    height: 1 / 1,
    parent: hudBox,
});
export const pauseIcon = new Object2D({
    x: 3 / 10,
    y: 3 / 10,
    width: 4 / 10,
    height: 4 / 10,
    parent: pauseButton,
});
new Rectangle({
    x: 0 / 3,
    y: 0 / 3,
    width: 1 / 3,
    height: 3 / 3,
    fill: pauseColor,
    line: foreground,
    updateThickness,
    parent: pauseIcon,
});
new Rectangle({
    x: 2 / 3,
    y: 0 / 3,
    width: 1 / 3,
    height: 3 / 3,
    fill: pauseColor,
    line: foreground,
    updateThickness,
    parent: pauseIcon,
});
export const timerBox = new Object2D({
    x: 2 / 3,
    y: 0 / 1,
    width: 1 / 3,
    height: 1 / 1,
    parent: hudBox,
});
export const timerText = new Text({
    x: 0,
    y: 0,
    width: 1,
    height: 1,
    color: timerColor,
    size: 4 / 10,
    weight: "bold",
    font: "ComicNeue Angular",
    content: ":20",
    parent: timerBox,
});
export const gameBox = new Object2D({
    entranceParent: safeArea,
    enterOption: {
        x: 0 / 3,
        y: 1 / 5,
        width: 3 / 3,
        height: 4 / 5,
    },
    exitOption: {
        x: 0 / 3,
        y: 1 / 5,
        width: 3 / 3,
        height: 4 / 5,
    },
});