import { describe, expect, it } from "vitest";
import { RateModel } from "./rate-model";

describe("RateModel.from", () => {
    it("should create from a bigint tuple", () => {
        const model = RateModel.from([900000000000000000n, 10000000000000000n, 100000000000000000n]);
        expect(model).toEqual({
            rate: 9e17,
            spread: 1e16,
            util: 1e17,
        });
    });
    it("should handle zero values", () => {
        const model = RateModel.from([0n, 0n, 0n]);
        expect(model).toEqual({ rate: 0, spread: 0, util: 0 });
    });
    it("should handle large values", () => {
        const model = RateModel.from([1000000000000000000n, 1000000000000000000n, 1000000000000000000n]);
        expect(model.rate).toBe(1e18);
        expect(model.spread).toBe(1e18);
        expect(model.util).toBe(1e18);
    });
});
describe("RateModel.init", () => {
    it("should return zero model", () => {
        expect(RateModel.init()).toEqual({ rate: 0, spread: 0, util: 0 });
    });
    it("should return a new object each time", () => {
        const a = RateModel.init();
        const b = RateModel.init();
        expect(a).toEqual(b);
        expect(a).not.toBe(b);
    });
});
