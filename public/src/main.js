import Scene from "./2d/scene.js";
import SafeArea from "./2d/safearea.js";
import Rectangle from "./2d/shape/rectangle.js";
import {
    colors,
    assets
} from "./asset.js";
import storage from "./storage.js";
import {
    start
} from "./screen/mainmenu.js";
import load from "./screen/loading.js";
export let canvas = document.querySelector("canvas#scene");
export let scene = new Scene({
    canvas: canvas,
    autoresize: true,
    child: new Rectangle({
        x: 0,
        y: 0,
        width: 1,
        height: 1,
        z: 2,
        fill: colors.BACKGROUND,
        operation: "destination-over"
    })
});
export let safeArea = new SafeArea({
    ratio: 3 / 5,
    parent: scene
});
export function updateThickness() {
    this.thickness = safeArea.width / 100;
};
export let theme;
export function setTheme(currentTheme) {
    storage.setItem("theme", currentTheme);
    if(currentTheme == "dark") {
        document.body.style.backgroundColor = "black";
        theme = "dark";
        colors.BACKGROUND.setColor("#111");
        colors.FOREGROUND.setColor(colors.WHITE);
        colors.ACCENT.setColor(colors.SKY_BLUE);
    }else{
        document.body.style.backgroundColor = "white";
        theme = "light";
        colors.BACKGROUND.setColor(colors.WHITE);
        colors.FOREGROUND.setColor(colors.BLACK);
        colors.ACCENT.setColor(colors.PH_BLUE);
    }
}
storage.setAllDefault({
    theme: "light",
    highscore_easy: 0,
    highscore_medium: 0,
    highscore_hard: 0,
    highscore_veryHard: 0
});
setTheme(storage.getItem("theme"));
load(assets).then(() => {
    start();
});
