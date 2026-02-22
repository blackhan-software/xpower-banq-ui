export function omit<
    T, K extends keyof T
>(
    obj: T, keys: K[]
): Omit<T, K> {
    const keyset = new Set<keyof T>(keys);
    const result: Partial<T> = {};
    for (const k in obj) {
        if (!keyset.has(k)) {
            result[k] = obj[k];
        }
    }
    return result as Omit<T, K>;
}
export default omit;
