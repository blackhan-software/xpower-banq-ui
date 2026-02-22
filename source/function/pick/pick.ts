export function pick<
    T, K extends keyof T
>(
    obj: T, keys: K[]
): Pick<T, K> {
    const result: Partial<T> = {};
    for (const k of keys) {
        result[k] = obj[k];
    }
    return result as Pick<T, K>;
}
export default pick;
