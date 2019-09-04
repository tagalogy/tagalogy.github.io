import Object2D from "../2d/object2d.js";
import Text from "../2d/shape/text.js";
import Image from "../2d/shape/image.js";
import {images} from "../asset.js";
import {
    colors
} from "../asset.js";
import {
    safeArea
} from "../main.js";
import {
    expoOut,
    sineIn
} from "../2d/easing.js";
let hud, score, game, pause;
export function startGame() {
    hud = new Object2D({
        parent: safeArea,
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
    score = new Text({
        parent: hud,
        isPositionRelative: true,
        isScaleRelative: true,
        x: 1 / 3,
        y: 0 / 1,
        width: 1 / 3,
        height: 1 / 1,
        weight: "bold",
        font: "ComicNueue Angular",
        color: colors.BLACK,
        isSizeRelative: true,
        size: 6 / 10,
        content: "0"
    });
    pause = new Image({
        parent: hud,
        isPositionRelative: true,
        isScaleRelative: true,
        x: 0 / 3,
        y: 0 / 1,
        width: 1 / 3,
        height: 1 / 1,
        source: images.PAUSE_PNG,
    })
    game = new Object2D({
        parent: safeArea,
        isPositionRelative: true,
        isScaleRelative: true,
        x: 0 / 3,
        y:  5 / 5,
        width: 3 / 3,
        height: 4 / 5
    });
    game.animateBound({
        isPositionRelative: true,
        isScaleRelative: true,
        x: 0 / 3,
        y:  1 / 5,
        width: 3 / 3,
        height: 4 / 5
    }, 400, expoOut);
}
function exitGame() {
    hud.animateBound({
        isPositionRelative: true,
        isScaleRelative: true,
        x: 0 / 3,
        y: -1 / 5,
        width: 3 / 3,
        height: 1 / 5
    }, 200, sineIn);
    game.animateBound({
        isPositionRelative: true,
        isScaleRelative: true,
        x: 0 / 3,
        y:  5 / 5,
        width: 3 / 3,
        height: 4 / 5
    }, 200, sineIn);
}
