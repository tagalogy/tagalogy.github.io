import Object2D from "../2d/object2d.js";
import Rectangle from "../2d/shape/rectangle.js";
import RoundedRectangle from "../2d/shape/rounded_rectangle.js";
import Text from "../2d/shape/text.js";
import SafeArea from "../2d/safearea.js";
import {
    expoOut
} from "../2d/easing.js";
import {
    scene,
    updateThickness
} from "../main.js";
import {
    colors
} from "../asset.js";
let dialogBox, msgBox;
let dialog = new Rectangle({
    x: 0,
    y: 0,
    width: 1,
    height: 1,
    fill: colors.WHITE,
    z: 2,
    child: new SafeArea({
        ratio: 3 / 5,
        isOpacityRelative: false,
        opacity: 1,
        child: dialogBox = new RoundedRectangle({
            fill: colors.WHITE,
            radius: 1 / 16,
            line: colors.BLACK,
            dash: [2, 2],
            updateThickness,
            children: [
                msgBox = new Text({
                    x: 1 / 8,
                    y: 1 / 8,
                    width: 6 / 8,
                    height: 3 / 8,
                    wrap: true,
                    align: "left",
                    baseline: "middle",
                    font: "ComicNueue Angular",
                    weight: "bold",
                    size: 1 / 4,
            		color: colors.BLACK
                })
            ]
        })
    })
});
export function popup(msg, ok, cancel) {
    dialog.addTo(scene);
    dialog.setOpacity(0);
    dialog.animateOpacity(3 / 4, 400);
    dialogBox.setBound({
        x: 1 / 6,
        y: 10 / 10,
        width: 4 / 6,
        height: 4 / 10,
    });
    dialogBox.animateBound({
        x: 1 / 6,
        y: 3 / 10,
        width: 4 / 6,
        height: 4 / 10,
    }, 400, expoOut);
    msgBox.content = msg;
}
