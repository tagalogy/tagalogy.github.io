import {Color} from "../graphics/color";
import {Object2D} from "../graphics/object2d";
import {RoundedRectangle} from "../graphics/shape/rounded_rectangle";
import {Text} from "../graphics/shape/text";
import {updateThickness} from "./update_thickness";
import {foreground} from "../asset/color";

export const inputBox = new Object2D;
const sideBox = new Object2D({
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
export const syllableBox = new Object2D({
    x: 0 / 4,
    y: 0 / 5,
    width: 3 / 4,
    height: 5 / 5,
    parent: inputBox,
});
export const clearFill = new Color;
export const clearLine = new Color;
export const clearColor = new Color;
export const hyphenFill = new Color;
export const hyphenLine = new Color;
export const hyphenColor = new Color;
export const clearPlace = new Object2D({
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
export const hyphenPlace = new Object2D({
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