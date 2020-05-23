type Primitives = undefined | null | boolean | number | bigint | string | symbol;
export function memoize<P extends Primitives, R>(func: (param: P) => R): (param: P) => R {
    const memo = new Map<P, R>();
    return param => {
        if (memo.has(param)) return memo.get(param)!;
        const value = func(param);
        memo.set(param, value);
        return value;
    };
}