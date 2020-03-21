import {background, foreground} from "../asset/color";
import {SafeArea} from "../graphics/safearea";
import {Rectangle} from "../graphics/shape/rectangle";
import {Text} from "../graphics/shape/text";
import {scene} from "./master";

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
    y: 4 / 10,
    width: 6 / 6,
    height: 2 / 10,
    font: "ComicNeue Angular",
    weight: "bold",
    size: 5 / 10,
    content: "nakahinto",
    color: foreground,
    parent: pauseBody,
});