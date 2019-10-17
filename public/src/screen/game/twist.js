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
import parseWord from "../../tagalog/parser.js";
import {
    nextGame,
    gameState,
    game
} from "../game.js";
let outputColor = new Color(colors.FOREGROUND);
let outputBox = new Text({
    font: "ComicNueue Angular",
    weight: "bold",
    size: 4 / 10,
    color: outputColor
});
let syllableBox;
let clearFill = new Color;
let clearLine = new Color;
let clearColor = new Color;
let hyphenFill = new Color;
let hyphenLine = new Color;
let hyphenColor = new Color;
let clearPlace, hyphenPlace;
let inputBox = new Object2D({
    children: [
        syllableBox = new Object2D({
            x: 0 / 4,
            y: 0 / 5,
            width: 3 / 4,
            height: 5 / 5
        }),
        new Object2D({
            x: 3 / 4,
            y: 0 / 5,
            width: 1 / 4,
            height: 5 / 5,
            children: [
                clearPlace = new Object2D({
                    x: 0,
                    y: 3 / 5,
                    width: 1,
                    height: 1 / 5,
                    child: new RoundedRectangle({
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
                        child: new Text({
                            x: 0,
                            y: 0,
                            width: 1,
                            height: 1,
                            font: "ComicNueue Angular",
                            color: clearColor,
                            size: 10 / 10,
                            content: "×",
                        })
                    }),
                    oninteractdown() {
                        clearColor.setColor(colors.BLACK);
                    }
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
                        dash: [2, 2],
                        dashSpeed: 2 / 1000,
                        fill: hyphenFill,
                        line: hyphenLine,
                        updateThickness,
                        radius: 1 / 2,
                        child: new Text({
                            x: 0,
                            y: 0,
                            width: 1,
                            height: 1,
                            font: "ComicNueue Angular",
                            color: hyphenColor,
                            size: 10 / 10,
                            content: "-",
                        })
                    }),
                    oninteractdown() {
                        hyphenColor.setColor(colors.BLACK);
                    }
                })
            ]
        })
    ]
});
let prevClearHandler;
let prevHyphenHandler;
export async function start(wordBank) {
    outputColor.setColor(colors.FOREGROUND);
    clearFill.setColor(colors.BACKGROUND);
    clearLine.setColor(colors.PH_RED);
    clearColor.setColor(colors.PH_RED);
    hyphenFill.setColor(colors.ACCENT);
    hyphenLine.setColor(colors.TRANSPARENT);
    hyphenColor.setColor(colors.WHITE);
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
        width: 8 / 10,
        height: 3 / 4
    });
    inputBox.animateBound({
        x: 1 / 10,
        y: 1 / 4,
        width: 8 / 10,
        height: 3 / 4
    }, 400, expoOut);
    let correct = wordBank[Math.floor(Math.random() * wordBank.length)];
    let word = parseWord(correct).filter(syllable => syllable !== "-");
    word.sort(() => Math.random() - Math.random());
    let currentPressed = 0;
    let currentLen = word.length;
    prevClearHandler = () => {
        if(gameState.paused) return;
        outputBox.content = "";
        currentPressed = 0;
        for(let button of syllableBox.children) button.unpress();
        clearFill.setColor(colors.BACKGROUND);
        clearLine.setColor(colors.PH_RED);
        clearColor.setColor(colors.PH_RED);
        hyphenFill.setColor(colors.ACCENT);
        hyphenLine.setColor(colors.TRANSPARENT);
        hyphenColor.setColor(colors.WHITE);
    };
    clearPlace.on("interactup", prevClearHandler);
    prevHyphenHandler = () => {
        if(gameState.paused) return;
        if(! outputBox.content.endsWith("-")) outputBox.content += "-";
        clearFill.setColor(colors.PH_RED);
        clearLine.setColor(colors.TRANSPARENT);
        clearColor.setColor(colors.WHITE);
        hyphenFill.setColor(colors.BACKGROUND);
        hyphenLine.setColor(colors.ACCENT);
        hyphenColor.setColor(colors.ACCENT);
    }
    hyphenPlace.on("interactup", prevHyphenHandler);
    let {length} = word;
    word.forEach((syllable, ind) => {
        syllable = syllable.toLowerCase();
        let lineColor = new Color(colors.TRANSPARENT);
        let fillColor = new Color(colors.ACCENT);
        let textColor = new Color(colors.WHITE);
        let width = 1;
        let x = 0;
        if(length >= 6 && ind > 3) {
            width = 2 / 3;
            if(ind > 4) x = 2 / 3;
        }
        let innerWidth;
        let innerX;
        if(length >= 6 && ind > 4) {
            innerWidth = 14 / 16;
            innerX = 1 / 16;
        }else{
            innerWidth = 46 / 48;
            innerX = 1 / 48;
        }
        let y = (4 - ind)/ 5;
        if(ind > 4) y = 0;
        let currentPlace = new Object2D({
            x,
            y,
            width,
            height: 1 / 5,
            child: new RoundedRectangle({
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
                textColor.setColor(colors.BLACK);
            },
            async oninteractup() {
                if(gameState.paused) return;
                lineColor.setColor(colors.ACCENT);
                fillColor.setColor(colors.BACKGROUND);
                textColor.setColor(colors.ACCENT);
                clearFill.setColor(colors.PH_RED);
                clearLine.setColor(colors.TRANSPARENT);
                clearColor.setColor(colors.WHITE);
                hyphenFill.setColor(colors.ACCENT);
                hyphenLine.setColor(colors.TRANSPARENT);
                hyphenColor.setColor(colors.WHITE);
                if(this.pressed) return;
                this.pressed = true;
                outputBox.content += this.content;
                currentPressed ++;
                if(currentPressed < currentLen) return;
                if(wordBank.indexOf(outputBox.content.toUpperCase()) >= 0) {
                    nextGame(end());
                    return;
                }
                outputColor.setColor("#f00");
                await outputColor.animateColor("#f000", 200);
                prevClearHandler();
                outputColor.setColor(colors.FOREGROUND);
            }
        });
        currentPlace.content = syllable;
        currentPlace.unpress = () => {
            if(! currentPlace.pressed) return;
            currentPlace.pressed = false;
            lineColor.setColor(colors.TRANSPARENT);
            fillColor.setColor(colors.ACCENT);
            textColor.setColor(colors.WHITE);
        };
        currentPlace.addTo(syllableBox);
    });
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
