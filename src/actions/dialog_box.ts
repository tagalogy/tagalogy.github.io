import {cancelBox, cancelColor, cancelFill, cancelText, dialogBox, dialogScreen, msgText, okBox, okColor, okFill, okText} from "../components/dialog_box";
import {overridePromise} from "../utils/override_promise";
import {timeout} from "../utils/time";
import {background, foreground, accent, white, redPH} from "../asset/color";

okBox.on("interactdown", () => {
    okFill.setColor(background);
    okColor.setColor(foreground);
});
okBox.on("interactup", () => {
    okFill.setColor(accent);
    okColor.setColor(white);
});
cancelBox.on("interactdown", () => {
    cancelFill.setColor(redPH);
    cancelColor.setColor(white);
});
cancelBox.on("interactup", () => {
    cancelFill.setColor(background);
    cancelColor.setColor(foreground);
});
export async function popup(msg: string, ok: string, cancel: string): Promise<boolean> {
    okFill.setColor(accent);
    cancelFill.setColor(background);
    cancelColor.setColor(foreground);
    dialogScreen.fadeIn();
    dialogBox.enter();
    msgText.content = msg;
    okText.content = ok;
    cancelText.content = cancel;
    const value = await Promise.race([
        overridePromise(okBox.once("interactup"), true),
        overridePromise(cancelBox.once("interactup"), false),
    ]);
    dialogScreen.fadeOut();
    dialogBox.exit();
    await timeout(200);
    return value;
}