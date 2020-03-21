import {gameBox, hudBox, pauseButton, pauseColor, scoreText, timerColor, timerText} from "../components/game";
import {scene} from "../components/master";
import {PlayState} from "../gameplay/play_state";
import {Twist} from "../gameplay/twist";
import {storage} from "../utils/storage";
import {now, timeout} from "../utils/time";
import {popup} from "./dialog_box";
import {start as startMainMenu} from "./mainmenu";
import {pause as pauseStart} from "./pause";
import {end as endTwist, start as startTwist} from "./twist";
import {skyblue, background, foreground} from "../asset/color";

export let gameState: PlayState;
pauseButton.on("interactdown", () => {
    if (gameState.paused) return;
    pauseColor.setColor(skyblue);
});
pauseButton.on("interactup", () => {
    if (gameState.paused) return;
    pauseColor.setColor(background);
    pause();
});
export let score = 0;
export const time = 20;
export let prevHandler: () => void;
export let currentGame: symbol;
export let currentDifficulty: string;
export let wordBank: string[];
export function startGame(difficulty: string, bank: string[]): void {
    currentDifficulty = difficulty;
    wordBank = bank;
    timerColor.setColor(foreground);
    pauseColor.setColor(background);
    gameState = new PlayState;
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
        const timeLeft = Math.ceil(time + (currentTime - gameState.time) / 1000);
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
export async function pause(): Promise<void> {
    gameState.pause();
    await pauseStart();
    gameState.play();
}
export async function exitGame(): Promise<void> {
    await hudBox.exit();
    await timeout(200);
    gameBox.remove();
    startMainMenu();
}
export async function endGame(correct: string): Promise<void> {
    gameState.stop();
    scene.off("frame", prevHandler);
    timerText.content = ":O";
    await shakeEffect();
    await timeout(500);
    const high = storage.getItem(currentDifficulty) as number;
    const currentScore = score;
    if (high < currentScore) storage.setItem(currentDifficulty, currentScore);
    timerText.content = ":(";
    endTwist();
    const message = `\
Tamang Sagot: ${correct}
Puntos: ${score}
Simulan muli?`;
    const response = await popup(message, "Oo", "Hindi");
    score = 0;
    scoreText.content = "0";
    if (response) {
        gameState = new PlayState;
        newGame();
    } else {
        exitGame();
    }
}
export async function shakeEffect(): Promise<void> {
    const oldUpdateBound = gameBox.updateBound;
    const startTime = now();
    gameBox.updateBound = function () {
        oldUpdateBound.call(this);
        const {x, width} = this;
        const alphaTime = ((now() - startTime) / 500) - 1;
        this.x = x + (Math.sin(alphaTime * 8 * Math.PI) * alphaTime * width / 8);
    };
    await timeout(500);
    gameBox.updateBound = oldUpdateBound;
}