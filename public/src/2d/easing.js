let sin = Math.sin;
let sqrt = Math.sqrt;
const PI = Math.PI;
export function wrapper(func) {
    return num => {
        if (num <= 0) return 0;
        if (num >= 1) return 1;
        return func(num);
    };
}
export let linear = wrapper(x => x);
export let sine = wrapper(x => (sin((x - 1 / 2) * PI) + 1) / 2);
export let sineIn = wrapper(x => sin((x - 1) * PI / 2) + 1);
export let sineOut = wrapper(x => sin(x * PI / 2));
export let expo = wrapper(x => x < 1 / 2 ? (2 ** (10 * (x - 1))) / 2 : (- (2 ** (x * -10)) + 2) / 2);
export let expoIn = wrapper(x => 2 ** (10 * (x - 1)));
export let expoOut = wrapper(x => - (2 ** (x * -10)) + 1);
export let circ = wrapper(x => x < 1 / 2 ? (sqrt(1 - x ** 2) + 1) / 2 : (sqrt(1 - (x - 1) ** 2) + 1) / 2);
export let circIn = wrapper(x => sqrt(1 - x ** 2) + 1);
export let circOut = wrapper(x => sqrt(1 - (x - 1) ** 2));
export function alphaToRange(alpha, min, max) {
    return alpha * (max - min) + min;
}
export function now() {
    return + new Date;
}
