import {background, foreground, accent, white} from "../asset/color";
import {SafeArea} from "../graphics/safearea";
import {Rectangle} from "../graphics/shape/rectangle";
import {Text} from "../graphics/shape/text";
import {scene} from "./master";
import {Object2d} from "../graphics/object_2d";
import {RoundedRectangle} from "../graphics/shape/rounded_rectangle";

export const pauseScreen = new Rectangle({
    x: 0,
    y: 0,
    width: 1,
    height: 1,
    fill: background,
    entranceParent: scene,
});
const pauseBody = new SafeArea({
    ratio: 3 / 5,
    parent: pauseScreen,
});
new Text({
    x: 0 / 6,
    y: 3 / 10,
    width: 6 / 6,
    height: 2 / 10,
    font: "ComicNeue Angular",
    weight: "bold",
    size: 5 / 10,
    content: "nakahinto",
    color: foreground,
    parent: pauseBody,
});
const buttonsPlace = new Object2d({
    x: 0 / 6,
    y: 8 / 10,
    width: 6 / 6,
    height: 2 / 10,
    parent: pauseBody,
});
export const continuePlace = new Object2d({
    x: 0 / 1,
    y: 1 / 2,
    width: 1 / 1,
    height: 1 / 2,
    parent: buttonsPlace,
});
new RoundedRectangle({
    x: 1 / 8,
    y: 0,
    width: 6 / 8,
    height: 1,
    fill: accent,
    radius: 1 / 2,
    parent: continuePlace,
});
new Text({
    x: 0,
    y: 0,
    width: 1,
    height: 1,
    font: "ComicNeue Angular",
    weight: "bold",
    size: 5 / 10,
    content: "ipagpatuloy",
    color: white,
    parent: continuePlace,
});
export const backPlace = new Object2d({
    x: 0 / 1,
    y: 0 / 2,
    width: 1 / 1,
    height: 1 / 2,
    parent: buttonsPlace,
});
new Text({
    x: 0,
    y: 0,
    width: 1,
    height: 1,
    font: "ComicNeue Angular",
    weight: "bold",
    size: 5 / 10,
    content: "bumalik",
    color: foreground,
    parent: backPlace,
});