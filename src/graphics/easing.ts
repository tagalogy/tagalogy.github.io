export interface EasingFunction {
    (x: number): number;
}
export function wrapper(func: EasingFunction): EasingFunction {
    return num => {
        if (num <= 0) return 0;
        if (num >= 1) return 1;
        return func(num);
    };
}
export const linear = wrapper(x => x);
export const sine = wrapper(x => (Math.sin((x - 1 / 2) * Math.PI) + 1) / 2);
export const sineIn = wrapper(x => Math.sin((x - 1) * Math.PI / 2) + 1);
export const sineOut = wrapper(x => Math.sin(x * Math.PI / 2));
export const expo = wrapper(x => x < 1 / 2 ? (2 ** (10 * (x - 1))) / 2 : (- (2 ** (x * -10)) + 2) / 2);
export const expoIn = wrapper(x => 2 ** (10 * (x - 1)));
export const expoOut = wrapper(x => - (2 ** (x * -10)) + 1);
export const circ = wrapper(x => x < 1 / 2 ? (Math.sqrt(1 - x ** 2) + 1) / 2 : (Math.sqrt(1 - (x - 1) ** 2) + 1) / 2);
export const circIn = wrapper(x => Math.sqrt(1 - x ** 2) + 1);
export const circOut = wrapper(x => Math.sqrt(1 - (x - 1) ** 2));

export function alphaToRange(alpha: number, min: number, max: number): number {
    return alpha * (max - min) + min;
}