// deno-lint-ignore-file no-explicit-any
export type MemoizedKey = number | string | symbol;
export type Memoized<
    F extends (...args: unknown[]) => unknown,
> = {
    (...args: Parameters<F>): ReturnType<F>;
};
/**
 * Memoize a (synchronous) function.
 *
 * @param fn The function to memoize
 * @param keyOf The key of the memoized value
 * @param getCache The cache to store the memoized values
 * @returns a memoized function
 */
export function memoized<F extends (...args: any[]) => any>(
    fn: F,
    keyOf?: (...args: Parameters<F>) => MemoizedKey,
    getCache?: () => Map<MemoizedKey, ReturnType<F>>,
): Memoized<F> {
    if (typeof getCache !== "function") {
        getCache = () => new Map<MemoizedKey, ReturnType<F>>();
    }
    const cache = getCache();
    const memoized = function (
        this: F,
        ...args: Parameters<F>
    ): ReturnType<F> {
        const key = keyOf ? keyOf.apply(this, args) : JSON.stringify(args);
        const cached = cache.get(key);
        if (cached !== undefined) {
            return cached;
        }
        const result = fn.apply(this, args);
        cache.set(key, result);
        return result;
    };
    return memoized as Memoized<F>;
}
export default memoized;
