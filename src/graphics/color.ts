import { noop } from "../utils/noop";
import { now, timeout } from "../utils/time";
import { alphaToRange, EasingFunction, sine } from "./easing";

declare function setTimeout(callback: () => void, delay: number): number;
declare function clearTimeout(id: number): void;

export interface ColorUpdater {
    (this: Color): void;
}
export interface ColorOption {
    red?: number;
    green?: number;
    blue?: number;
    alpha?: number;
    updateColor?: ColorUpdater;
}
export class Color {
    private colorAnimId = -1;

    red = 0;
    green = 0;
    blue = 0;
    alpha = 0;

    updateColor: ColorUpdater = noop;

    constructor(option: string | ColorOption = {}) {
        this.setColor(option);
    }
    getString(): string {
        this.updateColor();
        const { red, green, blue, alpha } = this;
        return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
    }
    toString(): string {
        return this.getString();
    }
    setColor(option: string | ColorOption): void {
        this.updateColor = updateColorWrapper(option);
    }
    async animateColor(
        option: string | ColorOption,
        time?: number,
        easing?: EasingFunction,
    ): Promise<void> {
        await this.animateUpdateColor(updateColorWrapper(option), time, easing);
    }
    async animateUpdateColor(
        updateColor: ColorUpdater,
        time = 400,
        easing = sine,
    ): Promise<void> {
        clearTimeout(this.colorAnimId);
        const oldUpdateColor = this.updateColor;
        const startTime = now();
        this.updateColor = function () {
            const alpha = easing((now() - startTime) / time);
            oldUpdateColor.call(this);
            const {
                red: oldRed,
                green: oldGreen,
                blue: oldBlue,
                alpha: oldAlpha,
            } = this;
            updateColor.call(this);
            const {
                red: newRed,
                green: newGreen,
                blue: newBlue,
                alpha: newAlpha,
            } = this;
            this.red = alphaToRange(alpha, oldRed, newRed);
            this.green = alphaToRange(alpha, oldGreen, newGreen);
            this.blue = alphaToRange(alpha, oldBlue, newBlue);
            this.alpha = alphaToRange(alpha, oldAlpha, newAlpha);
        };
        this.colorAnimId = setTimeout(() => {
            this.updateColor = updateColor;
        }, time);
        await timeout(time);
    }
}
export function updateColorWrapper(option: string | ColorOption): ColorUpdater {
    if (typeof option === "string") {
        option = option.trim();
        if (option[0] === "#") {
            const rawString = option.substring(1);
            const raw = parseInt(rawString, 16);
            let red: number;
            let green: number;
            let blue: number;
            let alpha: number;
            switch (rawString.length) {
                case 3:
                    red = ((raw >> (2 * 4)) & 0xf) * 0x11;
                    green = ((raw >> (1 * 4)) & 0xf) * 0x11;
                    blue = ((raw >> (0 * 4)) & 0xf) * 0x11;
                    alpha = 1;
                    break;
                case 4:
                    red = ((raw >> (3 * 4)) & 0xf) * 0x11;
                    green = ((raw >> (2 * 4)) & 0xf) * 0x11;
                    blue = ((raw >> (1 * 4)) & 0xf) * 0x11;
                    alpha = ((raw >> (0 * 4)) & 0xf) / 0xf;
                    break;
                case 6:
                    red = (raw >> (4 * 4)) & 0xff;
                    green = (raw >> (2 * 4)) & 0xff;
                    blue = (raw >> (0 * 4)) & 0xff;
                    alpha = 1;
                    break;
                case 8:
                    red = (raw >> (6 * 4)) & 0xff;
                    green = (raw >> (4 * 4)) & 0xff;
                    blue = (raw >> (2 * 4)) & 0xff;
                    alpha = ((raw >> (0 * 4)) & 0xff) / 0xff;
                    break;
            }
            return function () {
                this.red = red;
                this.green = green;
                this.blue = blue;
                this.alpha = alpha;
            };
        }
        throw new Error(`unable to parse ${option}`);
    }
    const { updateColor } = option;
    if (typeof updateColor !== "undefined") return updateColor;
    const { red, green, blue, alpha } = option;
    return function () {
        this.red = red ?? 255;
        this.green = green ?? 255;
        this.blue = blue ?? 255;
        this.alpha = alpha ?? 1;
    };
}
