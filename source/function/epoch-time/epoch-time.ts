export const YEARS = 31_556_952_000;
export const WEEKS = 604_800_000;
export const DAYS = 86_400_000;
/**
 * Returns the current epoch time in the given unit.
 *
 * @param unit_ms The unit in milliseconds.
 * @param now The current time in milliseconds.
 * @returns The current epoch time in the given unit.
 */
export function epochTime(
    unit_ms: number, now = Date.now()
) {
    return Math.floor(now / unit_ms);
}
export default epochTime;
