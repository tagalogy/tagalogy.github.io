import Object2D from "../2d/object2d.js";
import Color from "../2d/color.js";
import Text from "../2d/shape/text.js";
import FreeForm from "../2d/shape/freeform.js";
import RoundedRectangle from "../2d/shape/rounded_rectangle.js";
import Rectangle from "../2d/shape/rectangle.js";
import Image from "../2d/shape/image.js";
import Horizontal from "../2d/shape/horizontal.js";
import GameState from "../game_state.js";
import {
    popup
} from "./dialog_box.js";
import {
    colors
} from "../asset.js";
import {
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
let button;
let pauseBar0;
let pauseBar1;
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
            child: button = new Object2D({
                x: 3 / 10,
                y: 3 / 10,
                width: 4 / 10,
                height: 4 / 10,
                children: [
                    pauseBar0 = new Rectangle({
                        x: 0 / 3,
                        y: 0 / 3,
                        width: 1 / 3,
                        height: 3 / 3,
                        fill: pauseColor,
                        line: colors.BLACK,
                        updateThickness
                    }),
                    pauseBar1 = new Rectangle({
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
    game.setBound({
        isPositionRelative: true,
        isScaleRelative: true,
        x: 0 / 3,
        y:  5 / 5,
        width: 3 / 3,
        height: 4 / 5
    });
    game.addTo(safeArea);
    game.animateBound({
        isPositionRelative: true,
        isScaleRelative: true,
        x: 0 / 3,
        y:  1 / 5,
        width: 3 / 3,
        height: 4 / 5
    }, 400, expoOut);
    newGame();
}
export function newGame() {
    allGames[Math.floor(Math.random() * gameSize)]();
}
export async function nextGame(promise) {
    score.content = "" + (+ score.content + 1);
    if(promise) {
        await promise;
        newGame();
    }else{
        newGame();
    }
}
export async function pause() {
    gameState.pause();
    await pauseStart();
    gameState.play();
}
export function exitGame() {
}
