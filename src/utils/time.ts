export function timeout(delay: number): Promise<void> {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, delay);
    });
}
export function now(): number {
    return +new Date();
}
