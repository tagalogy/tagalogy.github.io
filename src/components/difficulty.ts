import {accent, white} from "../asset/color";
import {Object2d} from "../graphics/object_2d";
import {RoundedRectangle} from "../graphics/shape/rounded_rectangle";
import {Text} from "../graphics/shape/text";
import {safeArea} from "./master";

export const box = new Object2d({
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
export const raw = [
    {
        name: "madali",
        description: "3 pantig",
        difficultyKey: "easy",
        highscoreKey: "highscore_easy",
    },
    {
        name: "katamtaman",
        description: "3-4 pantig",
        difficultyKey: "medium",
        highscoreKey: "highscore_medium",
    },
    {
        name: "mahirap",
        description: "4-5 pantig",
        difficultyKey: "hard",
        highscoreKey: "highscore_hard",
    },
    {
        name: "mas mahirap",
        description: "5-6 pantig",
        difficultyKey: "very_hard",
        highscoreKey: "highscore_veryHard",
    },
] as const;
export const texts = new Map<"highscore_easy" | "highscore_medium" | "highscore_hard" | "highscore_veryHard", Text>();
export const buttons = new Map<"easy" | "medium" | "hard" | "very_hard", Object2d>();
for(let ind = 0; ind < raw.length; ind++) {
    const {name, description, difficultyKey, highscoreKey} = raw[ind];
    const button = new Object2d({
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
    texts.set(highscoreKey, highscoreBox);
    buttons.set(difficultyKey, button);
}