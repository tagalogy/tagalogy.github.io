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
    colors
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
    start as startTwist
} from "./game/twist.js";
let allGames = [
    startTwist
];
let gameSize = allGames.length;
export let gameState;
let score;
let timer;
let pauseColor = new Color(colors.WHITE);
let hud = new Object2D({
    children: [
        new Horizontal({
            x: 0,
            y: 1,
            width: 1,
            height: 0,
            line: colors.BLACK,
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
                        line: colors.BLACK,
                        updateThickness
                    }),
                    new Rectangle({
                        x: 2 / 3,
                        y: 0 / 3,
                        width: 1 / 3,
                        height: 3 / 3,
                        fill: pauseColor,
                        line: colors.BLACK,
                        updateThickness
                    })
                ]
            }),
            oninteractdown() {
                if(gameState.paused) return;
                pauseColor.setColor(colors.SKY_BLUE);
            },
            oninteractup() {
                if(gameState.paused) return;
                pauseColor.setColor(colors.WHITE);
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
                y: 0 ,
                width: 1,
                height: 1,
                size: 4 / 10,
                weight: "bold",
                font: "ComicNueue Angular",
                content: ":10"
            })
        })
    ]
});
export let game = new Object2D;
export function startGame() {
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
        y:  1 / 5,
        width: 3 / 3,
        height: 4 / 5
    });
    timer.content = ":10";
    newGame();
}
let prevHandler;
let currentGame;
export async function newGame() {
    let func = allGames[Math.floor(Math.random() * gameSize)];
    await func();
    let thisGame = currentGame;
    let currentTime = gameState.time;
    prevHandler = () => {
        if(gameState.stopped) return;
        let timeLeft = `${ Math.ceil(10 + (currentTime - gameState.time) / 1000) }`;
        timer.content = `:${ `00${ timeLeft }`.substring(timeLeft.length) }`;
    };
    scene.on("frame", prevHandler);
    await gameState.timeout(10000);
    if(thisGame !== currentGame) return;
    gameState.stop();
    scene.off("frame", prevHandler);
    timer.content = ":O";
    let oldUpdateBound = game.updateBound;
    let startTime = now();
    game.updateBound = function() {
        oldUpdateBound.call(this);
        let {
            x,
            width
        } = this;
        let alphaTime = ((now() - startTime) / 500) - 1;
        this.x = x + (Math.sin(alphaTime * 8 * Math.PI) * alphaTime * width / 8
        );
    };
    await timeout(500);
    game.updateBound = oldUpdateBound;
    await timeout(500);
    timer.content = ":(";
    func.end();
    let message = `
        Tamang Sagot: ${correct}
        Puntos: ${score.content}
        Simulan muli?
    `;
    if(await dialog(message, "Oo", "Hindi")) {
        score.content = "0";
        gameState = new GameState;
        newGame();
    }else{
        score.content = "0";
        exitGame();
    }
}
export async function nextGame(promise) {
    score.content = `${ + score.content + 1 }`;
    scene.off("frame", prevHandler);
    timer.content = ":D";
    currentGame = Symbol();
    if(promise) await promise;
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
