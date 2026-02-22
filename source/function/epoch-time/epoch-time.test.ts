import { describe, expect, it } from "vitest";
import { epochTime, DAYS, WEEKS } from "./epoch-time";

describe("epochTime", () => {
    it("should return epoch days for DAYS unit", () => {
        const expected = Math.floor(Date.now() / DAYS);
        expect(epochTime(DAYS)).toBe(expected);
    });
    it("should return epoch weeks for WEEKS unit", () => {
        const expected = Math.floor(Date.now() / WEEKS);
        expect(epochTime(WEEKS)).toBe(expected);
    });
    it("should accept a custom now parameter", () => {
        const now = 1_000_000_000_000; // ~2001-09-09
        expect(epochTime(DAYS, now)).toBe(Math.floor(now / DAYS));
    });
    it("should return a positive integer", () => {
        const result = epochTime(DAYS);
        expect(result).toBeGreaterThan(0);
        expect(Number.isInteger(result)).toBe(true);
    });
});
