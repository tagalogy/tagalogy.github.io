import Object2D from "../2d/object2d.js";
import Text from "../2d/shape/text.js";
import RoundedRectangle from "../2d/shape/rounded_rectangle.js";
import Rectangle from "../2d/shape/rectangle.js";
import Image from "../2d/shape/image.js";
import Horizontal from "../2d/shape/horizontal.js";
import {
    images
} from "../asset.js";
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
let score;
let hud = new Object2D({
    children: [
        new Object2D({
            isPositionRelative: true,
            isScaleRelative: true,
            x: 0 / 3,
            y: 0 / 1,
            width: 1 / 3,
            height: 1 / 1,
            children: [
                new Rectangle({
                    isPositionRelative: true,
                    isScaleRelative: true,
                    x: 3 / 12,
                    y: 3 / 12,
                    width: 2 / 12,
                    height: 6 / 12,
                    fill: colors.PH_YELLOW,
                    line: colors.BLACK,
                    updateThickness
                }),
                new Rectangle({
                    isPositionRelative: true,
                    isScaleRelative: true,
                    x: 7 / 12,
                    y: 3 / 12,
                    width: 2 / 12,
                    height: 6 / 12,
                    fill: colors.PH_YELLOW,
                    line: colors.BLACK,
                    updateThickness
                })
            ]
        }),
        score = new Text({
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
        }),
        new Horizontal({
            isPositionRelative: true,
            isScaleRelative: true,
            x: 0,
            y: 1,
            width: 1,
            height: 0,
            line: colors.BLACK,
            dash: [4, 4],
            dashSpeed: 2 / 1000,
            updateThickness,
        })
    ]
});
let game = new Object2D;
export function startGame() {
    hud.setBound({
        isPositionRelative: true,
        isScaleRelative: true,
        x: 0 / 3,
        y: - 1 / 5,
        width: 3 / 3,
        height: 1 / 5
    });
    hud.addTo(safeArea);
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
    game.addTo({});
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
}
