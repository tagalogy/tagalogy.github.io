export default function timeout(delay) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(delay);
        }, delay);
    });
}
export function now() {
    return + new Date;
}
