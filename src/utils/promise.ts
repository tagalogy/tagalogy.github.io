export async function overridePromise<T>(
    promise: Promise<unknown>,
    value: T,
): Promise<T> {
    await promise;
    return value;
}
export async function voidifyPromise(promise: Promise<unknown>): Promise<void> {
    await promise;
}
