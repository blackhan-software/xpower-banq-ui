import { randomBytes } from "ethers";

/**
 * Returns a random string for the provided number of bytes.
 *
 * @param bytes random bytes with 16 as default
 * @returns A random string
 */
export function random(bytes = 16): string {
    return '0x' + Array.from(randomBytes(bytes))
        .map((b) => Number(b).toString(16))
        .map((s) => s.padStart(2, '0'))
        .join('');
}
export default random;
