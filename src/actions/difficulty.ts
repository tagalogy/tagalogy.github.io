import { getDifficulty } from "../asset/asset";
import { box, buttons, raw, texts } from "../components/difficulty";
import { startGame } from "./game";
import { storage } from "../storage/storage";

for (const diffItem of raw) {
    const { difficultyKey, highscoreKey } = diffItem;
    const button = buttons.get(difficultyKey)!;
    button.on("interactup", async () => {
        await end();
        startGame(highscoreKey, getDifficulty(difficultyKey));
    });
}
export function start(): void {
    for (const [name, value] of texts) {
        value.content = "" + storage.getItem(name);
    }
    box.enter();
}
async function end(): Promise<void> {
    await box.exit();
}
