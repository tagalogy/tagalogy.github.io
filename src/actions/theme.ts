import {storage} from "../utils/storage";
import {background, foreground, white, accent, skyblue, black, bluePH} from "../asset/color";

export let theme: string;
export function setTheme(currentTheme: string): void {
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
setTheme(storage.getItem("theme") as string);