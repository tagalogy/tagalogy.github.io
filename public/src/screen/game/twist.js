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
    gameState,
    game
} from "../game.js";
let wordLen = WORD.length;
let outputBox = new Text({
    font: "ComicNueue Angular",
    weight: "bold",
    size: 4 / 10
});
let syllableBox;
let clearPlace, hyphenPlace;
let inputBox = new Object2D({
    children: [
        syllableBox = new Object2D({
            x: 0 / 5,
            y: 0 / 5,
            width: 4 / 5,
            height: 5 / 5
        }),
        new Object2D({
            x: 4 / 5,
            y: 0 / 5,
            width: 1 / 5,
            height: 5 / 5,
            children: [
                clearPlace = new Object2D({
                    x: 0,
                    y: 0 / 5,
                    width: 1,
                    height: 1 / 5,
                    child: new RoundedRectangle({
                        x: 1 / 8,
                        y: 1 / 8,
                        width: 6 / 8,
                        height: 6 / 8,
                        fill: colors.PH_RED,
                        radius: 1 / 2,
                        child: new Text({
                            x: 0,
                            y: 0,
                            width: 1,
                            height: 1,
                            font: "ComicNueue Angular",
                            color: colors.WHITE,
                            size: 10 / 10,
                            content: "×",
                        })
                    }),
                }),
                hyphenPlace = new Object2D({
                    x: 0,
                    y: 4 / 5,
                    width: 1,
                    height: 1 / 5,
                    child: new RoundedRectangle({
                        x: 1 / 8,
                        y: 1 / 8,
                        width: 6 / 8,
                        height: 6 / 8,
                        fill: colors.PH_BLUE,
                        radius: 1 / 2,
                        child: new Text({
                            x: 0,
                            y: 0,
                            width: 1,
                            height: 1,
                            font: "ComicNueue Angular",
                            color: colors.WHITE,
                            size: 10 / 10,
                            content: "-",
                        })
                    })
                })
            ]
        })
    ]
});
let prevClearHandler;
let prevHyphenHandler;
export async function start() {
    if(prevClearHandler) clearPlace.off("interactup", prevClearHandler);
    if(prevHyphenHandler) hyphenPlace.off("interactup", prevHyphenHandler);
    outputBox.content = "";
    outputBox.addTo(game);
    outputBox.setBound({
        x: 1,
        y: 0,
        width: 3 / 3,
        height: 1 / 4
    });
    outputBox.animateBound({
        x: 0,
        y: 0,
        width: 3 / 3,
        height: 1 / 4
    }, 400, expoOut);
    inputBox.addTo(game);
    inputBox.setBound({
        x: 1,
        y: 1 / 4,
        width: 3 / 3,
        height: 3 / 4
    });
    inputBox.animateBound({
        x: 0,
        y: 1 / 4,
        width: 3 / 3,
        height: 3 / 4
    }, 400, expoOut);
    let correct = WORD[Math.floor(Math.random() * wordLen)];
    let word = parseWord(correct).filter(syllable => syllable !== "-");
    word.sort(() => Math.random() - Math.random());
    let currentPressed = 0;
    let currentLen = word.length;
    word.forEach((syllable, ind) => {
        syllable = syllable.toLowerCase();
        let lineColor = new Color(colors.TRANSPARENT);
        let fillColor = new Color(colors.PH_BLUE);
        let textColor = new Color(colors.WHITE);
        let currentPlace = new Object2D({
            x: 0,
            y: (4 - ind)/ 5,
            width: 1,
            height: 1 / 5,
            child: new RoundedRectangle({
                x: 1 / 8,
                y: 1 / 8,
                width: 54 / 64,
                height: 6 / 8,
                dash: [2, 2],
                dashSpeed: 4 / 1000,
                fill: fillColor,
                line: lineColor,
                updateThickness,
                radius: 1 / 2,
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
            oninteractdown() {
                if(gameState.paused) return;
                lineColor.setColor(colors.PH_BLUE);
                fillColor.setColor(colors.WHITE);
                textColor.setColor(colors.PH_BLUE);
            },
            oninteractup() {
                if(gameState.paused) return;
                if(! this.pressed) {
                    this.pressed = true;
                    outputBox.content += this.content;
                    currentPressed ++;
                    if(currentPressed >= currentLen && WORD.indexOf(outputBox.content.toUpperCase()) >= 0) {
                        nextGame(end());
                    }
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
        currentPlace.addTo(syllableBox);
    });
    prevClearHandler = () => {
        if(gameState.paused) return;
        outputBox.content = "";
        currentPressed = 0;
        for(let button of syllableBox.children) button.unpress();
    };
    clearPlace.on("interactup", prevClearHandler);
    prevHyphenHandler = () => {
        if(gameState.paused) return;
        if(! outputBox.content.endsWith("-")) outputBox.content += "-";
    }
    hyphenPlace.on("interactup", prevHyphenHandler);
    await timeout(400);
    return correct.toLocaleLowerCase();
}
export async function end() {
    outputBox.animateBound({
        x: -1,
        y: 0,
        width: 3 / 3,
        height: 1 / 4
    }, 200, sineIn);
    inputBox.animateBound({
        x: -1,
        y: 1 / 4,
        width: 3 / 3,
        height: 3 / 4
    }, 200, sineIn);
    await timeout(200);
    syllableBox.removeAllChildren();
    outputBox.remove();
    inputBox.remove();
}
start.end = end;
