import {
    accent,
    background,
    black,
    foreground,
    redPH,
    skyblue,
    transparent,
    white,
} from "../asset/color";
import {
    clearColor,
    clearFill,
    clearLine,
    clearPlace,
    gameBox,
    hudBox,
    hyphenColor,
    hyphenFill,
    hyphenLine,
    hyphenPlace,
    inputBox,
    outputBox,
    outputColor,
    pauseButton,
    pauseColor,
    scoreText,
    syllableBox,
    timerColor,
    timerText,
} from "../components/game";
import { scene } from "../components/master";
import { updateThickness } from "../components/update_thickness";
import { PlayState } from "../gameplay/play_state";
import { Twist } from "../gameplay/twist";
import { Color } from "../graphics/color";
import { expoOut, sineIn } from "../graphics/easing";
import { Object2d } from "../graphics/object_2d";
import { RoundedRectangle } from "../graphics/shape/rounded_rectangle";
import { Text } from "../graphics/shape/text";
import { storage } from "../storage/storage";
import { now, timeout } from "../utils/time";
import { popup } from "./dialog_box";
import { startDifficulty } from "./mainmenu";
import { pause } from "./pause";

clearPlace.on("interactdown", () => {
    clearColor.setColor(black);
});
hyphenPlace.on("interactdown", () => {
    hyphenColor.setColor(black);
});
export let gameState: PlayState;
pauseButton.on("interactdown", () => {
    if (gameState.paused) return;
    pauseColor.setColor(skyblue);
});
pauseButton.on("interactup", () => {
    if (gameState.paused) return;
    pauseColor.setColor(background);
    pauseStart();
});
export let score = 0;
export const time = 20;
export let prevHandler: () => void;
export let currentGame: symbol;
export let currentDifficulty:
    | "highscore_easy"
    | "highscore_medium"
    | "highscore_hard"
    | "highscore_veryHard";
export let wordBank: string[];
export function startGame(
    difficulty:
        | "highscore_easy"
        | "highscore_medium"
        | "highscore_hard"
        | "highscore_veryHard",
    bank: string[],
): void {
    currentDifficulty = difficulty;
    wordBank = bank;
    timerColor.setColor(foreground);
    pauseColor.setColor(background);
    gameState = new PlayState();
    hudBox.enter();
    gameBox.enter();
    timerText.content = `:${time}`;
    newGame();
}
export async function newGame(): Promise<void> {
    const twist = new Twist(wordBank);
    const correct = twist.sourceWord;
    await startTwist(twist);
    const thisGame = currentGame;
    const currentTime = gameState.time;
    let previousTime: number;
    prevHandler = () => {
        if (gameState.stopped) return;
        const timeLeft = Math.ceil(
            time + (currentTime - gameState.time) / 1000,
        );
        timerText.content = ":" + timeLeft.toString().padStart(2, "0");
        if (timeLeft !== previousTime && timeLeft <= 5) {
            timerColor.setColor("#f00");
            timerColor.animateColor(foreground, 1000);
        }
        previousTime = timeLeft;
    };
    scene.on("frame", prevHandler);
    await gameState.timeout(time * 1000);
    if (thisGame === currentGame) await endGame(correct);
}
export async function nextGame(promise?: Promise<void>): Promise<void> {
    score++;
    scoreText.content = score.toString();
    scene.off("frame", prevHandler);
    timerText.content = ":D";
    currentGame = Symbol();
    if (promise) await promise;
    newGame();
}
export async function pauseStart(): Promise<void> {
    gameState.pause();
    const willContinue = await pause();
    if (willContinue) {
        gameState.play();
    } else {
        gameState.stop();
        saveHighscore();
        endTwist();
        exitGame();
    }
}
export async function exitGame(): Promise<void> {
    resetScore();
    await hudBox.exit();
    await timeout(200);
    gameBox.remove();
    startDifficulty();
}
export async function endGame(correct: string): Promise<void> {
    gameState.stop();
    scene.off("frame", prevHandler);
    timerText.content = ":O";
    await shakeEffect();
    await timeout(500);
    saveHighscore();
    timerText.content = ":(";
    endTwist();
    const message = `\
Tamang Sagot: ${correct}
Puntos: ${score}
Simulan muli?`;
    const response = await popup(message, "Oo", "Hindi");
    if (response) {
        gameState = new PlayState();
        resetScore();
        newGame();
    } else {
        exitGame();
    }
}
function saveHighscore(): void {
    const high = storage.getItem(currentDifficulty) ?? 0;
    if (high < score) storage.setItem(currentDifficulty, score);
}
export async function shakeEffect(): Promise<void> {
    const oldUpdateBound = gameBox.updateBound;
    const startTime = now();
    gameBox.updateBound = function () {
        oldUpdateBound.call(this);
        const { x, width } = this;
        const alphaTime = (now() - startTime) / 500 - 1;
        this.x =
            x + (Math.sin(alphaTime * 8 * Math.PI) * alphaTime * width) / 8;
    };
    await timeout(500);
    gameBox.updateBound = oldUpdateBound;
}
function resetScore(): void {
    score = 0;
    scoreText.content = "0";
}
window.addEventListener("beforeunload", saveHighscore);

let prevClearHandler: null | (() => void) = null;
let prevHyphenHandler: null | (() => void) = null;

function initTwist(): void {
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
    outputBox.animateBound(
        {
            x: 0,
            y: 0,
            width: 3 / 3,
            height: 1 / 4,
        },
        400,
        expoOut,
    );
    inputBox.addTo(gameBox);
    inputBox.setBound({
        x: 1,
        y: 1 / 4,
        width: 8 / 10,
        height: 3 / 4,
    });
    inputBox.animateBound(
        {
            x: 1 / 10,
            y: 1 / 4,
            width: 8 / 10,
            height: 3 / 4,
        },
        400,
        expoOut,
    );
}
// TODO: fix this mess
async function startTwist(twist: Twist): Promise<void> {
    initTwist();
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
    const { blocks } = twist;
    for (let ind = 0; ind < blocks.length; ind++) {
        const block = blocks[ind];
        const { syllable } = block;
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
                nextGame(endTwist());
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
async function endTwist(): Promise<void> {
    outputBox.animateBound(
        {
            x: -1,
            y: 0,
            width: 3 / 3,
            height: 1 / 4,
        },
        200,
        sineIn,
    );
    inputBox.animateBound(
        {
            x: -1,
            y: 1 / 4,
            width: 3 / 3,
            height: 3 / 4,
        },
        200,
        sineIn,
    );
    await timeout(200);
    syllableBox.removeAllChildren();
    outputBox.remove();
    inputBox.remove();
}
