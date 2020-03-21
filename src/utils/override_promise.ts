export async function overridePromise<T>(promise: Promise<unknown>, value: T): Promise<T> {
    await promise;
    return value;
}