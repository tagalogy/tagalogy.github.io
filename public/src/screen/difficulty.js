import {safeArea} from "../main.js";
import Object2D from "../2d/object2d.js";
import RoundedRectangle from "../2d/shape/rounded_rectangle.js";
import storage from "../storage.js";
import {
    difficulties,
    colors
} from "../asset.js";
import { startGame } from "./game.js";
import Text from "../2d/shape/text.js";
import { expoOut, sineIn } from "../2d/easing.js";
let raw = [
    {
        name: "madali",
        description: "3 pantig",
        difficultyKey: "EASY",
        highscoreKey: "highscore_easy"
    },
    {
        name: "katamtaman",
        description: "3-4 pantig",
        difficultyKey: "MEDIUM",
        highscoreKey: "highscore_medium"
    },
    {
        name: "mahirap",
        description: "4-5 pantig",
        difficultyKey: "HARD",
        highscoreKey: "highscore_hard"
    },
    {
        name: "mas mahirap",
        description: "5-6 pantig",
        difficultyKey: "VERY_HARD",
        highscoreKey: "highscore_veryHard"
    }
];
let box = new Object2D;
let highscore = Object.create(null);
let fill = colors.ACCENT;
raw.forEach(({name, description, difficultyKey, highscoreKey}, ind) => {
    let highscoreText;
    box.addChild(new Object2D({
        x: 0,
        y: ind / 4,
        width: 1,
        height: 1 / 4,
        child: new RoundedRectangle({
            x: 1/16,
            y: 1/16,
            width: 14/16,
            height: 14/16,
            radius: 1/8,
            fill,
            children: [
                new Text({
                    x: 1/16,
                    y: 0/2,
                    width: 14/16,
                    height: 1/2,
                    size: 5/10,
                    color: colors.WHITE,
                    align: "left",
                    baseline: "bottom",
                    font: "ComicNueue Angular",
                    weight: "bold",
                    content: name
                }),
                new Text({
                    x: 1/16,
                    y: 1/2,
                    width: 14/16,
                    height: 1/2,
                    size: 6/20,
                    color: colors.WHITE,
                    align: "left",
                    baseline: "top",
                    font: "ComicNueue Angular",
                    content: description
                }),
                highscoreText = new Text({
                    x: 1/16,
                    y: 0,
                    width: 14/16,
                    height: 1,
                    size: 4/10,
                    color: colors.WHITE,
                    align: "right",
                    weight: "bold",
                    font: "ComicNueue Angular"
                })
            ]
        }),
        async oninteractup() {
            await end();
            startGame(highscoreKey, difficulties[difficultyKey]);
        }
    }));
    highscore[highscoreKey] = highscoreText;
});
export function start() {
    box.addTo(safeArea);
    for(let name in highscore) highscore[name].content = `${storage.getItem(name)}`;
    box.setBound({
        x: 1,
        y: 1/5,
        width: 1,
        height: 4/5
    });
    box.animateBound({
        x: 0,
        y: 1/5,
        width: 1,
        height: 4/5
    }, 400, expoOut);
}
export async function end() {
    await box.animateBound({
        x: -1,
        y: 1/5,
        width: 1,
        height: 4/5
    }, 200, sineIn);
    box.remove();
}