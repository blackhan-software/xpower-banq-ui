import { memoized } from "@/function";
import Decimal from "decimal.js";

export const KMG_FORMAT = memoized((digits: number) => {
    const intl = new Intl.NumberFormat('en', {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
        compactDisplay: 'short',
        notation: 'compact',
    });
    return (n: number) => intl.format(n);
});
export const NUM_FORMAT = memoized((digits: number) => {
    const intl = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
        roundingMode: "floor",
    });
    return (n: number) => intl.format(n);
});
export const EXP_FORMAT = memoized((digits: number) => {
    return (n: number) => new Decimal(n).toExponential(
        digits ?? 0, Decimal.ROUND_FLOOR,
    );
});
export function NUMEXP_FORMAT(
    n: number,
    range = [1e-18, 1e-6] as [lhs: number, rhs: number],
    digits = [18, 6] as [exp: number, fix: number],
): string {
    if (n > range[0] && n < range[1]) {
        return EXP_FORMAT(digits[0])(n);
    }
    if (n >= range[1]) {
        return NUM_FORMAT(digits[1])(n);
    }
    return "0";
}
