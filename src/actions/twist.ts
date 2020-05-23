import {gameBox, clearColor, clearFill, clearLine, clearPlace, hyphenColor, hyphenFill, hyphenLine, hyphenPlace, inputBox, outputBox, outputColor, syllableBox} from "../components/game";
import {updateThickness} from "../components/update_thickness";
import {Twist} from "../gameplay/twist";
import {Color} from "../graphics/color";
import {expoOut, sineIn} from "../graphics/easing";
import {Object2d} from "../graphics/object_2d";
import {RoundedRectangle} from "../graphics/shape/rounded_rectangle";
import {Text} from "../graphics/shape/text";
import {timeout} from "../utils/time";
import {black, foreground, background, redPH, accent, transparent, white} from "../asset/color";

function setButtons(twist: Twist) {

}
clearPlace.on("interactdown", () => {
    clearColor.setColor(black);
});
hyphenPlace.on("interactdown", () => {
    hyphenColor.setColor(black);
});
let prevClearHandler: null | (() => void) = null;
let prevHyphenHandler: null | (() => void) = null;

function init(): void {
    outputColor.setColor(foreground);
    clearFill.setColor(background);
    clearLine.setColor(redPH);
    clearColor.setColor(redPH);
    hyphenFill.setColor(accent);
    hyphenLine.setColor(transparent);
    hyphenColor.setColor(white);
    if (prevClearHandler) clearPlace.off("interactup", prevClearHandler);
    if (prevHyphenHandler) hyphenPlace.off("interactup", prevHyphenHandler);
    outputBox.content = "";
    outputBox.addTo(gameBox);
    outputBox.setBound({
        x: 1,
        y: 0,
        width: 3 / 3,
        height: 1 / 4,
    });
    outputBox.animateBound({
        x: 0,
        y: 0,
        width: 3 / 3,
        height: 1 / 4,
    }, 400, expoOut);
    inputBox.addTo(gameBox);
    inputBox.setBound({
        x: 1,
        y: 1 / 4,
        width: 8 / 10,
        height: 3 / 4,
    });
    inputBox.animateBound({
        x: 1 / 10,
        y: 1 / 4,
        width: 8 / 10,
        height: 3 / 4,
    }, 400, expoOut);
}
// TODO: fix this mess
export async function start(twist: Twist): Promise<void> {
    init();
    const lineColors: Color[] = [];
    const fillColors: Color[] = [];
    const textColors: Color[] = [];
    prevClearHandler = () => {
        if (gameState.paused) return;
        twist.clear();
        outputBox.content = twist.formedWord;
        for (const color of lineColors) color.setColor(transparent);
        for (const color of fillColors) color.setColor(accent);
        for (const color of textColors) color.setColor(white);
        clearFill.setColor(background);
        clearLine.setColor(redPH);
        clearColor.setColor(redPH);
        hyphenFill.setColor(accent);
        hyphenLine.setColor(transparent);
        hyphenColor.setColor(white);
    };
    clearPlace.on("interactup", prevClearHandler);
    prevHyphenHandler = () => {
        if (gameState.paused) return;
        twist.addHyphen();
        outputBox.content = twist.formedWord;
        clearFill.setColor(redPH);
        clearLine.setColor(transparent);
        clearColor.setColor(white);
        hyphenFill.setColor(background);
        hyphenLine.setColor(accent);
        hyphenColor.setColor(accent);
    };
    hyphenPlace.on("interactup", prevHyphenHandler);
    const {blocks} = twist;
    for (let ind = 0; ind < blocks.length; ind++) {
        const block = blocks[ind];
        const {syllable} = block;
        const lineColor = new Color(transparent);
        const fillColor = new Color(accent);
        const textColor = new Color(white);
        lineColors.push(lineColor);
        fillColors.push(fillColor);
        textColors.push(textColor);
        let width = 1;
        let x = 0;
        if (length >= 6 && ind > 3) {
            width = 2 / 3;
            if (ind > 4) x = 2 / 3;
        }
        let innerWidth;
        let innerX;
        if (length >= 6 && ind > 4) {
            innerWidth = 14 / 16;
            innerX = 1 / 16;
        } else {
            innerWidth = 46 / 48;
            innerX = 1 / 48;
        }
        let y = (4 - ind) / 5;
        if (ind > 4) y = 0;
        const currentPlace = new Object2d({
            x,
            y,
            width,
            height: 1 / 5,
            parent: syllableBox,
        });
        currentPlace.on("interactdown", () => {
            if (gameState.paused) return;
            textColor.setColor(black);
        });
        currentPlace.on("interactup", async () => {
            if (gameState.paused) return;
            lineColor.setColor(accent);
            fillColor.setColor(background);
            textColor.setColor(accent);
            clearFill.setColor(redPH);
            clearLine.setColor(transparent);
            clearColor.setColor(white);
            hyphenFill.setColor(accent);
            hyphenLine.setColor(transparent);
            hyphenColor.setColor(white);
            twist.press(ind);
            outputBox.content = twist.formedWord;
            if (!twist.isFilled) return;
            if (twist.isValid) {
                nextGame(end());
            } else {
                outputColor.setColor("#f00");
                await outputColor.animateColor("#f000", 200);
                prevClearHandler?.();
                outputColor.setColor(foreground);
            }

        });
        const currentShape = new RoundedRectangle({
            x: innerX,
            y: 1 / 8,
            width: innerWidth,
            height: 6 / 8,
            dash: [2, 2],
            dashSpeed: 4 / 1000,
            fill: fillColor,
            line: lineColor,
            updateThickness,
            radius: 1 / 2,
            parent: currentPlace,
        });
        new Text({
            x: 0,
            y: 0,
            width: 1,
            height: 1,
            font: "ComicNeue Angular",
            weight: "bold",
            color: textColor,
            size: 6 / 10,
            content: syllable,
            parent: currentShape,
        });
    }
}
export async function end(): Promise<void> {
    outputBox.animateBound({
        x: -1,
        y: 0,
        width: 3 / 3,
        height: 1 / 4,
    }, 200, sineIn);
    inputBox.animateBound({
        x: -1,
        y: 1 / 4,
        width: 3 / 3,
        height: 3 / 4,
    }, 200, sineIn);
    await timeout(200);
    syllableBox.removeAllChildren();
    outputBox.remove();
    inputBox.remove();
}