import {theme} from "../actions/theme";
import {Images} from "../asset/asset";
import {Color} from "../graphics/color";
import {linear} from "../graphics/easing";
import {Object2D, updateBoundWrapper} from "../graphics/object2d";
import {FreeForm} from "../graphics/shape/freeform";
import {Image} from "../graphics/shape/image";
import {RoundedRectangle} from "../graphics/shape/rounded_rectangle";
import {Text} from "../graphics/shape/text";
import {now} from "../utils/time";
import {safeArea} from "./master";
import {updateThickness} from "./update_thickness";
import {white, yellowPH, background, foreground, black} from "../asset/color";

const startTime = now();

export const titleBox = new Object2D({
    entranceParent: safeArea,
    enterOption: {
        updateBound: function (this: Object2D) {
            titleBoxPos.call(this);
            this.y += Math.sin((now() - startTime) / 2000 * Math.PI) * this.height / 64;
        },
    },
    exitOption: {
        x: 1 / 12,
        y: -16 / 20,
        width: 10 / 12,
        height: 14 / 20,
    },
});
export const titleImage = new Image({
    x: 0,
    y: 0,
    width: 1,
    height: 1,
    parent: titleBox,
});
export const shineShape = new FreeForm({
    path: [
        [0, 1],
        [3 / 4, 0],
        [1, 0],
        [1 / 4, 1]
    ],
    opacity: 1 / 4,
    fill: white,
    operation: "source-atop",
    parent: titleBox,
});
setInterval(() => {
    shineShape.setBound({
        x: -1,
        y: 0,
        width: 1,
        height: 1,
    });
    shineShape.animateBound({
        x: 1,
        y: 0,
        width: 1,
        height: 1,
    }, 700, linear);
}, 4000);
const buttonLine = new Color;
const buttonFill = new Color;
const buttonColor = new Color;
export const startButton = new RoundedRectangle({
    fill: buttonFill,
    line: buttonLine,
    dash: [4, 4],
    dashSpeed: 4 / 1000,
    updateThickness,
    radius: 0.5,
    cap: "butt",
    join: "miter",
    entranceParent: safeArea,
    enterOption: {
        x: 1 / 6,
        y: 7 / 10,
        width: 4 / 6,
        height: 1 / 10,
    },
    exitOption: {
        x: 1 / 6,
        y: 10 / 10,
        width: 4 / 6,
        height: 1 / 10,
    },
});
new Text({
    x: 0,
    y: 0,
    width: 1,
    height: 1,
    weight: "bold",
    font: "ComicNeue Angular",
    color: buttonColor,
    size: 6 / 10,
    content: "simulan",
    parent: startButton,
});
export const settings = new Object2D({
    x: 0 / 6,
    y: 0 / 10,
    width: 6 / 6,
    height: 1 / 10,
    entranceParent: safeArea,
});
export const themeButton = new Object2D({
    x: 0,
    y: 0,
    width: 1 / 6,
    height: 1,
    parent: settings,
});
export const bulbImage = new Image({
    x: 1 / 6,
    y: 1 / 6,
    width: 4 / 6,
    height: 4 / 6,
    parent: themeButton,
});
export const titleBoxPos = updateBoundWrapper({
    x: 1 / 12,
    y: 0 / 20,
    width: 10 / 12,
    height: 14 / 20,
});
export function updateColor() {
    if (theme === "dark") {
        buttonLine.setColor(yellowPH);
        buttonFill.setColor(background);
        buttonColor.setColor(yellowPH);
        titleImage.source = Images.TITLE_DARK_PNG;
    } else {
        buttonLine.setColor(foreground);
        buttonFill.setColor(yellowPH);
        buttonColor.setColor(black);
        titleImage.source = Images.TITLE_PNG;
    }
}
