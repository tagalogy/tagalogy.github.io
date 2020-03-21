import {pauseScreen} from "../components/pause";

export async function pause(): Promise<void> {
    await pauseScreen.fadeIn();
    await pauseScreen.once("interactup");
    await pauseScreen.fadeOut();
}