/**
 * Generate a query key from a text string.
 *
 * @param text string to hash.
 * @param radix base to use (2–36, default: 16).
 * @returns a positive integer hash.
 */
export function queryKey(text: string, radix = 16): string {
    if (radix < 2 || radix > 36) {
        throw new RangeError("outside of [2,36]");
    }
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
        hash = ((hash << 5) - hash) + text.charCodeAt(i);
        hash |= 0; // force 32-bit
    }
    return (hash >>> 0).toString(radix); // positive
}
export default queryKey;
