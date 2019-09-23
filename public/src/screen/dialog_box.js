import Object2D from "../2d/object2d.js";
import Rectangle from "../2d/shape/rectangle.js";
import RoundedRectangle from "../2d/shape/rounded_rectangle.js";
import Text from "../2d/shape/text.js";
import SafeArea from "../2d/safearea.js";
import {
    sineIn,
    expoOut
} from "../2d/easing.js";
import {
    scene
} from "../main.js";
import {
    colors
} from "../asset.js";
import timeout from "../timeout.js";
let dialogBox, msgBox, cancelBox, okBox, cancelText, okText;
let dialog = new Rectangle({
    x: 0,
    y: 0,
    width: 1,
    height: 1,
    fill: colors.BLACK,
    child: new SafeArea({
        ratio: 3 / 5,
        isOpacityRelative: false,
        opacity: 1,
        child: dialogBox = new RoundedRectangle({
            fill: colors.WHITE,
            radius: 1 / 16,
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
                    size: 1 / 4,
            		color: colors.BLACK
                }),
                new Object2D({
                    x: 0 / 8,
                    y: 6 / 8,
                    width: 8 / 8,
                    height: 2 / 8,
                    children: [
                        cancelBox = new Object2D({
                            x: 0,
                            y: 0,
                            width: 1 / 2,
                            height: 1,
                            child: cancelText = new Text({
                                x: 0,
                                y: 0,
                                width: 1,
                                height: 1,
                                size: 4 / 10,
                                color: colors.BLACK,
                                font: "ComicNueue Angular",
                                weight: "bold"
                            })
                        }),
                        okBox = new RoundedRectangle({
                            x: 1 / 2,
                            y: 0,
                            width: 1 / 2,
                            height: 1,
                            radius: 1 / 4,
                            fill: colors.PH_BLUE,
                            child: okText = new Text({
                                x: 0,
                                y: 0,
                                width: 1,
                                height: 1,
                                size: 4 / 10,
                                color: colors.WHITE,
                                font: "ComicNueue Angular",
                                weight: "bold"
                            })
                        })
                    ]
                })
            ]
        })
    })
});
export default async function popup(msg, ok, cancel) {
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
    okText.content = ok;
    cancelText.content = cancel;
    let value = await Promise.race([
        overridePromise(okBox.once("interactup"), true),
        overridePromise(cancelBox.once("interactup"), false)
    ]);
    dialog.animateOpacity(0, 200);
    dialogBox.animateBound({
        x: 1 / 6,
        y: 10 / 10,
        width: 4 / 6,
        height: 4 / 10,
    }, 200, sineIn);
    await timeout(200);
    dialog.remove();
    return value;
}
async function overridePromise(promise, value) {
    await promise;
    return value;
}