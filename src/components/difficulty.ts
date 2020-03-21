import {Object2D} from "../graphics/object2d";
import {RoundedRectangle} from "../graphics/shape/rounded_rectangle";
import {Text} from "../graphics/shape/text";
import {safeArea} from "./master";
import {accent, white} from "../asset/color";

export const box = new Object2D({
    entranceParent: safeArea,
    enterOption: {
        x: 0,
        y: 1 / 5,
        width: 1,
        height: 4 / 5,
    },
    exitOption: {
        x: 1,
        y: 1 / 5,
        width: 1,
        height: 4 / 5,
    },
});
interface Raw {
    name: string;
    description: string;
    difficultyKey: "EASY" | "MEDIUM" | "HARD" | "VERY_HARD";
    highscoreKey: string;
}
export const raw: Raw[] = [
    {
        name: "madali",
        description: "3 pantig",
        difficultyKey: "EASY",
        highscoreKey: "highscore_easy",
    },
    {
        name: "katamtaman",
        description: "3-4 pantig",
        difficultyKey: "MEDIUM",
        highscoreKey: "highscore_medium",
    },
    {
        name: "mahirap",
        description: "4-5 pantig",
        difficultyKey: "HARD",
        highscoreKey: "highscore_hard",
    },
    {
        name: "mas mahirap",
        description: "5-6 pantig",
        difficultyKey: "VERY_HARD",
        highscoreKey: "highscore_veryHard",
    },
];
export const texts: Record<string, Text> = Object.create(null);
export const buttons: Record<Raw["difficultyKey"], Object2D> = Object.create(null);
for(let ind = 0; ind < raw.length; ind++) {
    const {name, description, difficultyKey, highscoreKey} = raw[ind];
    const button = new Object2D({
        x: 0,
        y: ind / 4,
        width: 1,
        height: 1 / 4,
    });
    const buttonBox = new RoundedRectangle({
        x: 1 / 16,
        y: 1 / 16,
        width: 14 / 16,
        height: 14 / 16,
        radius: 1 / 8,
        fill: accent,
        parent: button,
    });
    new Text({
        x: 1 / 16,
        y: 0 / 2,
        width: 14 / 16,
        height: 1 / 2,
        size: 5 / 10,
        color: white,
        align: "left",
        baseline: "bottom",
        font: "ComicNeue Angular",
        weight: "bold",
        content: name,
        parent: buttonBox,
    });
    new Text({
        x: 1 / 16,
        y: 1 / 2,
        width: 14 / 16,
        height: 1 / 2,
        size: 6 / 20,
        color: white,
        align: "left",
        baseline: "top",
        font: "ComicNeue Angular",
        content: description,
        parent: buttonBox,
    });
    const highscoreBox = new Text({
        x: 1 / 16,
        y: 0,
        width: 14 / 16,
        height: 1,
        size: 4 / 10,
        color: white,
        align: "right",
        weight: "bold",
        font: "ComicNeue Angular",
        parent: buttonBox,
    });
    box.addChild(button);
    texts[highscoreKey] = highscoreBox;
    buttons[difficultyKey] = button;
}