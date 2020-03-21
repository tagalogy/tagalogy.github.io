export function timeout(delay: number): Promise<number> {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(delay);
        }, delay);
    });
}
export function now(): number {
    return + new Date;
}