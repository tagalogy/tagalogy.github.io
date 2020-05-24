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
import { start } from "./difficulty";
import { setTheme, theme } from "./theme";

startButton.on("interactup", async () => {
    await end();
    start();
});
themeButton.on("interactup", () => {
    setTheme(theme === "dark" ? "light" : "dark");
    updateColor();
});
export function startMainMenu(): void {
    updateColor();
    bulbImage.source = imageLoader.get("/asset/bulb.png");
    titleBox.enter();
    startButton.enter();
    settings.fadeIn();
}
async function end(): Promise<void> {
    startButton.exit();
    titleBox.exit();
    settings.fadeOut();
    await timeout(200);
}
