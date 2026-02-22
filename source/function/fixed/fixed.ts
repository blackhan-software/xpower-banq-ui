export type FixedMode = "ceil" | "floor" | "round";

/**
 * Rounds a number to a fixed number of digits with a
 * specified rounding mode, where the default mode is
 * `round`.
 *
 * @returns The fixed-point representation of a number.
 */
export function fixed(
    value: number,
    digits: number = 0,
    mode: FixedMode = "round",
): string {
    const factor = Math.pow(10, digits);
    if (mode === "floor") {
        return `${Math.floor(value * factor) / factor}`;
    }
    if (mode === "ceil") {
        return `${Math.ceil(value * factor) / factor}`;
    }
    return `${Math.round(value * factor) / factor}`;
}
export default fixed;
