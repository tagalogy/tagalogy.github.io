import {Difficulties} from "../asset/asset";
import {box, buttons, texts, raw} from "../components/difficulty";
import {storage} from "../utils/storage";
import {startGame} from "./game";

for (const diffItem of raw) {
    const {difficultyKey, highscoreKey} = diffItem;
    const button = buttons[difficultyKey];
    button.on("interactup", async () => {
        await end();
        startGame(highscoreKey, Difficulties[difficultyKey]);
    });
}
export function start(): void {
    for (const name of Object.keys(texts)) {
        texts[name].content = storage.getItem(name)?.toString() ?? "";
    }
    box.enter();
}
export async function end(): Promise<void> {
    await box.exit();
}