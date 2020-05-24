import { load } from "./actions/loading";
import { startMainMenu } from "./actions/mainmenu";
import { assetsLoaded } from "./asset/asset";
import { storage } from "./storage/storage";

storage.setDefaults({
    theme: "light",
    highscore_easy: 0,
    highscore_medium: 0,
    highscore_hard: 0,
    highscore_veryHard: 0,
});
load(assetsLoaded).then(() => {
    startMainMenu();
});
