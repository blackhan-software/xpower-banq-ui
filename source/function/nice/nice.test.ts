import { describe, expect, it } from "vitest";
import { nice } from "./nice";

describe("nice", () => {
    it("should format integers with ' separator", () => {
        expect(nice(1000)).toBe("1'000");
        expect(nice(1000000)).toBe("1'000'000");
    });
    it("should format with default precision", () => {
        expect(nice(0)).toBe("0");
        expect(nice(1.5)).toBe("1.5");
        expect(nice(1.123)).toBe("1.123");
    });
    it("should respect maxPrecision", () => {
        expect(nice(1.123456, { maxPrecision: 2 })).toBe("1.12");
        expect(nice(1.1, { maxPrecision: 1 })).toBe("1.1");
    });
    it("should respect minPrecision", () => {
        expect(nice(1, { minPrecision: 2 })).toBe("1.00");
        expect(nice(1.5, { minPrecision: 3 })).toBe("1.500");
    });
    it("should handle negative numbers", () => {
        expect(nice(-1000)).toBe("-1'000");
        expect(nice(-1.5)).toBe("-1.5");
    });
    it("should handle bigint values", () => {
        expect(nice(1000n)).toBe("1'000");
    });
    it("should apply base rescaling", () => {
        expect(nice(1000, { base: 10 })).toBe("100");
    });
    it("should append suffix", () => {
        expect(nice(1500, { suffix: "K" })).toBe("1'500K");
    });
});
