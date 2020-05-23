import {
    background,
    foreground,
    white,
    accent,
    skyblue,
    black,
    bluePH,
} from "../asset/color";
import { storage } from "../storage/storage";

export let theme: "dark" | "light";
export function setTheme(currentTheme: "dark" | "light"): void {
    storage.setItem("theme", currentTheme);
    if (currentTheme === "dark") {
        document.body.style.backgroundColor = "black";
        theme = "dark";
        background.setColor("#222");
        foreground.setColor(white);
        accent.setColor(skyblue);
    } else {
        document.body.style.backgroundColor = "white";
        theme = "light";
        background.setColor(white);
        foreground.setColor(black);
        accent.setColor(bluePH);
    }
}
setTheme(storage.getItem("theme") ?? "light");
