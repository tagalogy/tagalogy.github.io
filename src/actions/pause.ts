import {pauseScreen, continuePlace, backPlace} from "../components/pause";
import {overridePromise} from "../utils/override_promise";
import {popup} from "./dialog_box";

export async function pause(): Promise<boolean> {
    await pauseScreen.fadeIn();
    while (true) {
        const respondContinue = await Promise.race([
            overridePromise(continuePlace.once("interactup"), true),
            overridePromise(backPlace.once("interactup"), false),
        ]);
        if (respondContinue) {
            await pauseScreen.fadeOut();
            return true;
        }
        const confirmContinue = await popup("Sigurado kang gusto mong itigil ang laro at bumalik?", "Ituloy", "Itigil");
        if (! confirmContinue) {
            await pauseScreen.fadeOut();
            return false;
        }
    }
}