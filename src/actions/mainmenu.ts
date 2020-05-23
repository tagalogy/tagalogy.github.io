import { imageLoader } from "../asset/asset";
import {
    bulbImage,
    settings,
    startButton,
    themeButton,
    titleBox,
    updateColor,
} from "../components/mainmenu";
import { timeout } from "../utils/time";
import { start as startGame } from "./difficulty";
import { setTheme, theme } from "./theme";

startButton.on("interactup", async () => {
    await end();
    startGame();
});
themeButton.on("interactup", () => {
    setTheme(theme === "dark" ? "light" : "dark");
    updateColor();
});
export function start(): void {
    updateColor();
    bulbImage.source = imageLoader.get("/asset/bulb.png");
    titleBox.enter();
    startButton.enter();
    settings.fadeIn();
}
export async function end(): Promise<void> {
    startButton.exit();
    titleBox.exit();
    settings.fadeOut();
    await timeout(200);
}
