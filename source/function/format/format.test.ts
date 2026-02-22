import { describe, expect, it } from "vitest";
import { NUM_FORMAT, EXP_FORMAT } from "./format";

describe('NUM_FORMAT', () => {
    it("should format 0e0 to 0", () => {
        expect(NUM_FORMAT(0)(0e0)).toEqual("0");
    });
    it("should format 1e3 to 1,000.0", () => {
        expect(NUM_FORMAT(1)(1e3)).toEqual("1,000.0");
    });
    it("should format 2e6 to 2,000,000.00", () => {
        expect(NUM_FORMAT(2)(2e6)).toEqual("2,000,000.00");
    });
});
describe('NUM_FORMAT', () => {
    it("should format 0.1 to 0", () => {
        expect(NUM_FORMAT(0)(0.1)).toEqual("0");
    });
    it("should format 0.1 to 0.1", () => {
        expect(NUM_FORMAT(1)(0.1)).toEqual("0.1");
    });
    it("should format 0.01 to 0.01", () => {
        expect(NUM_FORMAT(2)(0.01)).toEqual("0.01");
    });
});
describe('EXP_FORMAT', () => {
    it("should format 0 to 0e+0", () => {
        expect(EXP_FORMAT(0)(0)).toEqual("0e+0");
    });
    it("should format 1 to 1.0e+0", () => {
        expect(EXP_FORMAT(1)(1)).toEqual("1.0e+0");
    });
    it("should format 2 to 2.00e+0", () => {
        expect(EXP_FORMAT(2)(2)).toEqual("2.00e+0");
    });
});
describe('EXP_FORMAT', () => {
    it("should format 0.1 to 1e-0", () => {
        expect(EXP_FORMAT(0)(0.1)).toEqual("1e-1");
    });
    it("should format 0.1 to 1.0e-1", () => {
        expect(EXP_FORMAT(1)(0.1)).toEqual("1.0e-1");
    });
    it("should format 0.01 to 1.00e-2", () => {
        expect(EXP_FORMAT(2)(0.01)).toEqual("1.00e-2");
    });
});
