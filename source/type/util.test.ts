import { describe, expect, it } from "vitest";
import { Util } from "./util";

describe("Util.from", () => {
    it("should convert bigint to number", () => {
        const u = Util.from(500000000000000000n); // 0.5 * 1e18
        expect(u.value).toBe(5e17);
    });
    it("should handle zero", () => {
        expect(Util.from(0n).value).toBe(0);
    });
    it("should handle full utilization", () => {
        expect(Util.from(1000000000000000000n).value).toBe(1e18);
    });
});
describe("Util.eq", () => {
    it("should return true for equal values", () => {
        expect(Util.eq({ value: 42 }, { value: 42 })).toBe(true);
    });
    it("should return false for different values", () => {
        expect(Util.eq({ value: 1 }, { value: 2 })).toBe(false);
    });
    it("should return true for both null", () => {
        expect(Util.eq(null, null)).toBe(true);
    });
    it("should return true for both undefined", () => {
        expect(Util.eq(undefined, undefined)).toBe(true);
    });
    it("should return false when only lhs is null", () => {
        expect(Util.eq(null, { value: 0 })).toBe(false);
    });
    it("should return false when only rhs is null", () => {
        expect(Util.eq({ value: 0 }, null)).toBe(false);
    });
});
