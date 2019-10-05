import SafeArea from "../2d/safearea.js";
import Rectangle from "../2d/shape/rectangle.js";
import Text from "../2d/shape/text.js";
import {
    colors
} from "../asset.js";
import {
    scene
} from "../main.js";
let pauseBox = new Rectangle({
    x: 0,
    y: 0,
    width: 1,
    height: 1,
    fill: colors.BACKGROUND,
    child: new SafeArea({
    	ratio: 3 / 5,
        child: new Text({
            x: 0 / 6,
            y: 4 / 10,
            width: 6 / 6,
            height: 2 / 10,
            font: "ComicNueue Angular",
            weight: "bold",
            size: 5 / 10,
            content: "nakahinto",
            color: colors.FOREGROUND
        }),
    })
});
export async function start() {
    pauseBox.addTo(scene);
    pauseBox.setOpacity(0);
    await pauseBox.animateOpacity(1, 200);
    await pauseBox.once("interactup");
    await pauseBox.animateOpacity(0, 200);
    pauseBox.remove();
}
