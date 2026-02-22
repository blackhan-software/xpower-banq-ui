import { describe, expect, it } from "vitest";
import { nice_si } from "./nice-si";

describe("nice_si", () => {
    it("should format thousands as K", () => {
        expect(nice_si(1500)).toBe("1.5K");
        expect(nice_si(10000)).toBe("10K");
    });
    it("should format millions as M", () => {
        expect(nice_si(2_500_000)).toBe("2.5M");
    });
    it("should format billions as G", () => {
        expect(nice_si(1_000_000_000)).toBe("1G");
    });
    it("should format sub-thousand values without suffix", () => {
        expect(nice_si(500)).toBe("500");
        expect(nice_si(999)).toBe("999");
    });
    it("should handle negative numbers", () => {
        expect(nice_si(-1500)).toBe("-1.5K");
    });
    it("should use scientific notation for tiny numbers", () => {
        const result = nice_si(0.001);
        expect(result).toMatch(/E/i);
    });
});
