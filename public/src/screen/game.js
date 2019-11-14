import Object2D from "../2d/object2d.js";
import Color from "../2d/color.js";
import Text from "../2d/shape/text.js";
import RoundedRectangle from "../2d/shape/rounded_rectangle.js";
import Rectangle from "../2d/shape/rectangle.js";
import Horizontal from "../2d/shape/horizontal.js";
import GameState from "../game_state.js";
import dialog from "./dialog_box.js";
import {
    start as startMainMenu
} from "./mainmenu.js";
import timeout, {
    now
} from "../timeout.js";
import {
    colors, sfx
} from "../asset.js";
import {
    scene,
    safeArea,
    updateThickness
} from "../main.js";
import {
    expoOut,
    sineIn
} from "../2d/easing.js";
import {
    start as pauseStart
} from "./pause.js";
import {
    start as startTwist,
    end as endTwist
} from "./game/twist.js";
import storage from "../storage.js";
export let gameState;
let time = 20;
let score;
let timer;
let timerColor = new Color;
let pauseColor = new Color;
let hud = new Object2D({
    children: [
        new Horizontal({
            x: 0,
            y: 1,
            width: 1,
            height: 0,
            line: colors.FOREGROUND,
            dash: [4, 4],
            dashSpeed: 2 / 1000,
            updateThickness,
        }),
        new Object2D({
            x: 0 / 3,
            y: 0 / 1,
            width: 1 / 3,
            height: 1 / 1,
            child: new Object2D({
                x: 3 / 10,
                y: 3 / 10,
                width: 4 / 10,
                height: 4 / 10,
                children: [
                    new Rectangle({
                        x: 0 / 3,
                        y: 0 / 3,
                        width: 1 / 3,
                        height: 3 / 3,
                        fill: pauseColor,
                        line: colors.FOREGROUND,
                        updateThickness
                    }),
                    new Rectangle({
                        x: 2 / 3,
                        y: 0 / 3,
                        width: 1 / 3,
                        height: 3 / 3,
                        fill: pauseColor,
                        line: colors.FOREGROUND,
                        updateThickness
                    })
                ]
            }),
            oninteractdown() {
                if (gameState.paused) return;
                pauseColor.setColor(colors.SKY_BLUE);
            },
            oninteractup() {
                if (gameState.paused) return;
                sfx.CLICK.play();
                pauseColor.setColor(colors.BACKGROUND);
                pause();
            }
        }),
        new Object2D({
            x: 1 / 3,
            y: 0 / 1,
            width: 1 / 3,
            height: 1 / 1,
            child: new RoundedRectangle({
                x: 2 / 10,
                y: 2 / 10,
                width: 6 / 10,
                height: 6 / 10,
                fill: colors.PH_YELLOW,
                radius: 2 / 10,
                child: score = new Text({
                    x: 0,
                    y: 0,
                    width: 1,
                    height: 1,
                    weight: "bold",
                    font: "ComicNueue Angular",
                    color: colors.BLACK,
                    size: 6 / 10,
                    content: "0"
                })
            })
        }),
        new Object2D({
            x: 2 / 3,
            y: 0 / 1,
            width: 1 / 3,
            height: 1 / 1,
            child: timer = new Text({
                x: 0,
                y: 0,
                width: 1,
                height: 1,
                color: timerColor,
                size: 4 / 10,
                weight: "bold",
                font: "ComicNueue Angular",
                content: `:${time}`
            })
        })
    ]
});
let currentDifficulty;
let wordBank;
export let game = new Object2D;
export function startGame(name, bank) {
    currentDifficulty = name;
    wordBank = bank;
    timerColor.setColor(colors.FOREGROUND);
    pauseColor.setColor(colors.BACKGROUND);
    gameState = new GameState;
    hud.addTo(safeArea);
    hud.setBound({
        isPositionRelative: true,
        isScaleRelative: true,
        x: 0 / 3,
        y: - 1 / 5,
        width: 3 / 3,
        height: 1 / 5
    });
    hud.animateBound({
        isPositionRelative: true,
        isScaleRelative: true,
        x: 0 / 3,
        y: 0 / 5,
        width: 3 / 3,
        height: 1 / 5
    }, 400, expoOut);
    game.addTo(safeArea);
    game.setBound({
        isPositionRelative: true,
        isScaleRelative: true,
        x: 0 / 3,
        y: 1 / 5,
        width: 3 / 3,
        height: 4 / 5
    });
    timer.content = `:${time}`;
    newGame();
}
let prevHandler;
let currentGame;
export async function newGame() {
    let correct = await startTwist(wordBank);
    let thisGame = currentGame;
    let currentTime = gameState.time;
    let previousTime;
    prevHandler = () => {
        if (gameState.stopped) return;
        let timeLeft = Math.ceil(time + (currentTime - gameState.time) / 1000);
        let timeLeftString = `${timeLeft}`;
        timer.content = `:${`00${timeLeftString}`.substring(timeLeftString.length)}`;
        if (timeLeft !== previousTime && timeLeft <= 5) {
            timerColor.setColor("#f00");
            timerColor.animateColor(colors.FOREGROUND, 1000);
        }
        previousTime = timeLeft;
    };
    scene.on("frame", prevHandler);
    await gameState.timeout(time * 1000);
    if (thisGame !== currentGame) return;
    sfx.FAIL.play();
    gameState.stop();
    scene.off("frame", prevHandler);
    timer.content = ":O";
    let oldUpdateBound = game.updateBound;
    let startTime = now();
    game.updateBound = function () {
        oldUpdateBound.call(this);
        let {
            x,
            width
        } = this;
        let alphaTime = ((now() - startTime) / 500) - 1;
        this.x = x + (Math.sin(alphaTime * 8 * Math.PI) * alphaTime * width / 8);
    };
    await timeout(500);
    game.updateBound = oldUpdateBound;
    await timeout(500);
    let high = storage.getItem(currentDifficulty);
    let currentScore = + score.content;
    if (high < currentScore) storage.setItem(currentDifficulty, currentScore);
    timer.content = ":(";
    endTwist();
    let message = `
        Tamang Sagot: ${correct}
        Puntos: ${score.content}
        Simulan muli?
    `;
    sfx.GAME_OVER.play();
    if (await dialog(message, "Oo", "Hindi")) {
        score.content = "0";
        gameState = new GameState;
        newGame();
    } else {
        score.content = "0";
        exitGame();
    }
}
export async function nextGame(promise) {
    score.content = `${+ score.content + 1}`;
    scene.off("frame", prevHandler);
    timer.content = ":D";
    currentGame = Symbol();
    if (promise) await promise;
    newGame();
}
export async function pause() {
    gameState.pause();
    await pauseStart();
    gameState.play();
}
export async function exitGame() {
    await hud.animateBound({
        isPositionRelative: true,
        isScaleRelative: true,
        x: 0 / 3,
        y: - 1 / 5,
        width: 3 / 3,
        height: 1 / 5
    }, 200, sineIn);
    hud.remove();
    game.remove();
    startMainMenu();
}
