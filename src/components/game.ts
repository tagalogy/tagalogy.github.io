import { Color } from "../graphics/color";
import { Object2d } from "../graphics/object_2d";
import { Horizontal } from "../graphics/shape/horizontal";
import { Rectangle } from "../graphics/shape/rectangle";
import { RoundedRectangle } from "../graphics/shape/rounded_rectangle";
import { Text } from "../graphics/shape/text";
import { safeArea } from "./master";
import { updateThickness } from "./update_thickness";
import { foreground, yellowPH, black } from "../asset/color";

export const hudBox = new Object2d({
    entranceParent: safeArea,
    enterOption: {
        x: 0 / 3,
        y: 0 / 5,
        width: 3 / 3,
        height: 1 / 5,
    },
    exitOption: {
        x: 0 / 3,
        y: -1 / 5,
        width: 3 / 3,
        height: 1 / 5,
    },
});
export const timerColor = new Color();
export const pauseColor = new Color();
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
export const scoreBox = new Object2d({
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
export const pauseButton = new Object2d({
    x: 0 / 3,
    y: 0 / 1,
    width: 1 / 3,
    height: 1 / 1,
    parent: hudBox,
});
export const pauseIcon = new Object2d({
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
export const timerBox = new Object2d({
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
export const gameBox = new Object2d({
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
export const inputBox = new Object2d();
const sideBox = new Object2d({
    x: 3 / 4,
    y: 0 / 5,
    width: 1 / 4,
    height: 5 / 5,
    parent: inputBox,
});
export const outputColor = new Color(foreground);
export const outputBox = new Text({
    font: "ComicNeue Angular",
    weight: "bold",
    size: 4 / 10,
    color: outputColor,
});
export const syllableBox = new Object2d({
    x: 0 / 4,
    y: 0 / 5,
    width: 3 / 4,
    height: 5 / 5,
    parent: inputBox,
});
export const clearFill = new Color();
export const clearLine = new Color();
export const clearColor = new Color();
export const hyphenFill = new Color();
export const hyphenLine = new Color();
export const hyphenColor = new Color();
export const clearPlace = new Object2d({
    x: 0,
    y: 3 / 5,
    width: 1,
    height: 1 / 5,
    parent: sideBox,
});
const clearShape = new RoundedRectangle({
    x: 1 / 8,
    y: 1 / 8,
    width: 6 / 8,
    height: 6 / 8,
    dash: [2, 2],
    dashSpeed: 2 / 1000,
    fill: clearFill,
    line: clearLine,
    updateThickness,
    radius: 1 / 2,
    parent: clearPlace,
});
new Text({
    x: 0,
    y: 0,
    width: 1,
    height: 1,
    font: "ComicNeue Angular",
    color: clearColor,
    size: 10 / 10,
    content: "\u00d7",
    parent: clearShape,
});
export const hyphenPlace = new Object2d({
    x: 0,
    y: 4 / 5,
    width: 1,
    height: 1 / 5,
    parent: sideBox,
});
const hyphenShape = new RoundedRectangle({
    x: 1 / 8,
    y: 1 / 8,
    width: 6 / 8,
    height: 6 / 8,
    dash: [2, 2],
    dashSpeed: 2 / 1000,
    fill: hyphenFill,
    line: hyphenLine,
    updateThickness,
    radius: 1 / 2,
    parent: hyphenPlace,
});
new Text({
    x: 0,
    y: 0,
    width: 1,
    height: 1,
    font: "ComicNeue Angular",
    color: hyphenColor,
    size: 10 / 10,
    content: "-",
    parent: hyphenShape,
});
