import Object2D from "../../2d/object2d.js";
import RoundedRectangle from "../../2d/shape/rounded_rectangle.js";
import Text from "../../2d/shape/text.js";
import Color from "../../2d/color.js";
import timeout from "../../timeout.js";
import {
    expoOut,
    sineIn
} from "../../2d/easing.js";
import {
    colors
} from "../../asset.js";
import {
    updateThickness
} from "../../main.js";
import {
    WORD
} from "../../tagalog/word.js";
import parseWord from "../../tagalog/parser.js";
import {
    nextGame,
    game
} from "../game.js";
let wordLen = WORD.length;
let inputBox = new Text({
    font: "ComicNueue Angular",
    weight: "bold",
    size: 5 / 10,
    content: ""
});
let buttonBox = new Object2D;
let prevHandler;
export function start() {
    if(prevHandler) inputBox.off("interactup", prevHandler);
    inputBox.content = "";
    inputBox.addTo(game);
    inputBox.setBound({
        x: 1,
        y: 0,
        width: 3 / 3,
        height: 1 / 4
    });
    inputBox.animateBound({
        x: 0,
        y: 0,
        width: 3 / 3,
        height: 1 / 4
    }, 400, expoOut);
    buttonBox.addTo(game);
    buttonBox.setBound({
        x: 1,
        y: 1 / 4,
        width: 3 / 3,
        height: 3 / 4
    });
    buttonBox.animateBound({
        x: 0,
        y: 1 / 4,
        width: 3 / 3,
        height: 3 / 4
    }, 400, expoOut);
    let input = [];
    let word = parseWord(WORD[Math.floor(Math.random() * wordLen)]);
    word.sort(() => Math.random() - Math.random());
    let currentLen = word.length;
    word.forEach((syllable, ind) => {
        debugger;
        syllable = syllable.toLowerCase();
        let lineColor = new Color(colors.TRANSPARENT);
        let fillColor = new Color(colors.PH_BLUE);
        let textColor = new Color(colors.WHITE);
        let currentPlace = new Object2D({
            x: 0,
            y: (5 - ind)/ 6,
            width: 1,
            height: 1 / 6,
            child: new RoundedRectangle({
                x: 1 / 8,
                y: 1 / 8,
                width: 6 / 8,
                height: 6 / 8,
                dash: [4 / 4],
                fill: fillColor,
                line: lineColor,
                updateThickness,
                child: new Text({
                    x: 0,
                    y: 0,
                    width: 1,
                    height: 1,
                    font: "ComicNueue Angular",
                    weight: "bold",
                    color: textColor,
                    size: 6 / 10,
                    content: syllable,
                })
            }),
            oninteractup() {
                if(this.pressed) return;
                this.pressed = true;
                input.push(this.content);
                inputBox.content += this.content;
                lineColor.setColor(colors.PH_BLUE);
                fillColor.setColor(colors.WHITE);
                textColor.setColor(colors.PH_BLUE);
                if(input.length >= currentLen && WORD.indexOf(input.join("").toUpperCase()) >= 0) {
                    nextGame(end());
                }
            }
        });
        currentPlace.content = syllable;
        currentPlace.unpress = () => {
            currentPlace.pressed = false;
            lineColor.setColor(colors.TRANSPARENT);
            fillColor.setColor(colors.PH_BLUE);
            textColor.setColor(colors.WHITE);
        }
        currentPlace.addTo(buttonBox);
    });
    let {
        children
    } = buttonBox;
    prevHandler = () => {
        if(input.length <= 0) return;
        let last = input[input.length - 1];
        input.pop();
        inputBox.content = input.join("");
        for(let child of children) {
            if(child.content == last) {
                child.unpress();
                break;
            }
        }
    }
    inputBox.on("interactup", prevHandler);
}
export async function end() {
    inputBox.animateBound({
        x: -1,
        y: 0,
        width: 3 / 3,
        height: 1 / 4
    }, 200, sineIn);
    buttonBox.animateBound({
        x: -1,
        y: 1 / 4,
        width: 3 / 3,
        height: 3 / 4
    }, 200, sineIn);
    await timeout(200);
    buttonBox.removeAllChildren();
    inputBox.remove();
    buttonBox.remove();
}
