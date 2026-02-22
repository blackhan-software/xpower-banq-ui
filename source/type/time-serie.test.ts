import { describe, it, expect } from "vitest";
import TimeSerie from "./time-serie.js";

describe("Rates.inter", () => {
    it("should inter daily |serie| = 0", () => {
        expect(TimeSerie.inter([])).toEqual([]);
    });
    it("should inter daily |serie| = 1", () => {
        const serie: TimeSerie = [
            [[0.25], new Date("2025-09-15"), 2],
        ];
        expect(TimeSerie.inter(serie)).toEqual(serie);
    });
    it("should inter daily |serie| = 2", () => {
        const serie: TimeSerie = [
            [[0.250, 0.251], new Date("2025-09-15"), 2],
            [[0.500, 0.501], new Date("2025-09-20"), 4],
        ];
        expect(TimeSerie.inter(serie)).toEqual([
            [[0.250, 0.251], new Date("2025-09-15"), 2],
            [[0.500, 0.501], new Date("2025-09-16"), 0], // inter
            [[0.500, 0.501], new Date("2025-09-17"), 0], // inter
            [[0.500, 0.501], new Date("2025-09-18"), 0], // inter
            [[0.500, 0.501], new Date("2025-09-19"), 0], // inter
            [[0.500, 0.501], new Date("2025-09-20"), 4],
        ]);
    });
    it("should inter daily |serie| = 3", () => {
        const serie: TimeSerie = [
            [[0.250, 0.251, 0.252], new Date("2025-09-15"), 2],
            [[0.500, 0.501, 0.502], new Date("2025-09-20"), 4],
            [[0.750, 0.751, 0.752], new Date("2025-09-30"), 3],
        ];
        expect(TimeSerie.inter(serie)).toEqual([
            [[0.250, 0.251, 0.252], new Date("2025-09-15"), 2],
            [[0.500, 0.501, 0.502], new Date("2025-09-16"), 0], // inter
            [[0.500, 0.501, 0.502], new Date("2025-09-17"), 0], // inter
            [[0.500, 0.501, 0.502], new Date("2025-09-18"), 0], // inter
            [[0.500, 0.501, 0.502], new Date("2025-09-19"), 0], // inter
            [[0.500, 0.501, 0.502], new Date("2025-09-20"), 4],
            [[0.750, 0.751, 0.752], new Date("2025-09-21"), 0], // inter
            [[0.750, 0.751, 0.752], new Date("2025-09-22"), 0], // inter
            [[0.750, 0.751, 0.752], new Date("2025-09-23"), 0], // inter
            [[0.750, 0.751, 0.752], new Date("2025-09-24"), 0], // inter
            [[0.750, 0.751, 0.752], new Date("2025-09-25"), 0], // inter
            [[0.750, 0.751, 0.752], new Date("2025-09-26"), 0], // inter
            [[0.750, 0.751, 0.752], new Date("2025-09-27"), 0], // inter
            [[0.750, 0.751, 0.752], new Date("2025-09-28"), 0], // inter
            [[0.750, 0.751, 0.752], new Date("2025-09-29"), 0], // inter
            [[0.750, 0.751, 0.752], new Date("2025-09-30"), 3],
        ]);
    });
});
describe("Rates.extra", () => {
    const range = {
        lhs: new Date("2025-09-15"),
        rhs: new Date("2025-09-30"),
    };
    it("should extra daily |serie| = 0", () => {
        expect(TimeSerie.extra([], range)).toEqual([]);
    });
    it("should extra daily |serie| = 1", () => {
        const serie: TimeSerie = [
            [[0.25], new Date("2025-09-15"), 2],
        ];
        expect(TimeSerie.extra(serie, range)).toEqual([
            [[0.25], new Date("2025-09-15"), 2],
            [[0.25], new Date("2025-09-16"), 0], // extra
            [[0.25], new Date("2025-09-17"), 0], // extra
            [[0.25], new Date("2025-09-18"), 0], // extra
            [[0.25], new Date("2025-09-19"), 0], // extra
            [[0.25], new Date("2025-09-20"), 0], // extra
            [[0.25], new Date("2025-09-21"), 0], // extra
            [[0.25], new Date("2025-09-22"), 0], // extra
            [[0.25], new Date("2025-09-23"), 0], // extra
            [[0.25], new Date("2025-09-24"), 0], // extra
            [[0.25], new Date("2025-09-25"), 0], // extra
            [[0.25], new Date("2025-09-26"), 0], // extra
            [[0.25], new Date("2025-09-27"), 0], // extra
            [[0.25], new Date("2025-09-28"), 0], // extra
            [[0.25], new Date("2025-09-29"), 0], // extra
            [[0.25], new Date("2025-09-30"), 0], // extra
        ]);
    });
    it("should extra daily |serie| = 2", () => {
        const serie: TimeSerie = [
            [[0.250, 0.251], new Date("2025-09-15"), 2],
            [[0.500, 0.501], new Date("2025-09-20"), 4],
        ];
        expect(TimeSerie.extra(serie, range)).toEqual([
            [[0.250, 0.251], new Date("2025-09-15"), 2],
            [[0.500, 0.501], new Date("2025-09-20"), 4],
            [[0.500, 0.501], new Date("2025-09-21"), 0], // extra
            [[0.500, 0.501], new Date("2025-09-22"), 0], // extra
            [[0.500, 0.501], new Date("2025-09-23"), 0], // extra
            [[0.500, 0.501], new Date("2025-09-24"), 0], // extra
            [[0.500, 0.501], new Date("2025-09-25"), 0], // extra
            [[0.500, 0.501], new Date("2025-09-26"), 0], // extra
            [[0.500, 0.501], new Date("2025-09-27"), 0], // extra
            [[0.500, 0.501], new Date("2025-09-28"), 0], // extra
            [[0.500, 0.501], new Date("2025-09-29"), 0], // extra
            [[0.500, 0.501], new Date("2025-09-30"), 0], // extra
        ]);
    });
    it("should extra daily |serie| = 3", () => {
        const serie: TimeSerie = [
            [[0.250, 0.251], new Date("2025-09-15"), 2],
            [[0.500, 0.501], new Date("2025-09-20"), 4],
            [[0.750, 0.751], new Date("2025-09-30"), 3],
        ];
        expect(TimeSerie.extra(serie, range)).toEqual([
            [[0.250, 0.251], new Date("2025-09-15"), 2],
            [[0.500, 0.501], new Date("2025-09-20"), 4],
            [[0.750, 0.751], new Date("2025-09-30"), 3],
        ]);
    });
});
describe("Rates.clip", () => {
    const range = {
        lhs: new Date("2025-09-15"),
        rhs: new Date("2025-09-30"),
    };
    it("should clip daily |serie| = 0", () => {
        expect(TimeSerie.clip([], range)).toEqual([]);
    });
    it("should clip daily |serie| = 1", () => {
        const serie: TimeSerie = [
            [[0.25], new Date("2025-09-15"), 2],
        ];
        expect(TimeSerie.clip(serie, range)).toEqual(serie);
    });
    it("should clip daily |serie| = 2", () => {
        const serie: TimeSerie = [
            [[0.250, 0.251, 0.252], new Date("2025-09-10"), 2], // clip
            [[0.500, 0.501, 0.502], new Date("2025-09-20"), 4],
        ];
        expect(TimeSerie.clip(serie, range)).toEqual([
            [[0.500, 0.501, 0.502], new Date("2025-09-20"), 4],
        ]);
    });
    it("should clip daily |serie| = 3", () => {
        const serie: TimeSerie = [
            [[0.250, 0.251, 0.252], new Date("2025-09-10"), 2], // clip
            [[0.500, 0.501, 0.502], new Date("2025-09-20"), 4],
            [[1.000, 1.001, 1.002], new Date("2025-10-01"), 1], // clip
        ];
        expect(TimeSerie.clip(serie, range)).toEqual([
            [[0.500, 0.501, 0.502], new Date("2025-09-20"), 4],
        ]);
    });
});
describe("Rates.uniq", () => {
    it("should uniq daily |serie| = 0", () => {
        expect(TimeSerie.uniq([])).toEqual([]);
    });
    it("should uniq daily |serie| = 1", () => {
        const serie: TimeSerie = [
            [[0.25], new Date("2025-09-15"), 2],
        ];
        expect(TimeSerie.uniq(serie)).toEqual(serie);
    });
    it("should uniq daily |serie| = 2", () => {
        const serie: TimeSerie = [
            [[0.250, 0.251], new Date("2025-09-15"), 2],
            [[0.500, 0.501], new Date("2025-09-15"), 4],
        ];
        expect(TimeSerie.uniq(serie)).toEqual([
            [[
                (0.250 * 2 + 0.500 * 4) / (2 + 4),
                (0.251 * 2 + 0.501 * 4) / (2 + 4),
            ], new Date("2025-09-15"), 6],
        ]);
    });
    it("should uniq daily |serie| = 3", () => {
        const serie: TimeSerie = [
            [[0.250, 0.251, 0.252], new Date("2025-09-15"), 2],
            [[0.500, 0.501, 0.502], new Date("2025-09-15"), 4],
            [[0.750, 0.751, 0.752], new Date("2025-09-16"), 3],
        ];
        expect(TimeSerie.uniq(serie)).toEqual([
            [[
                (0.250 * 2 + 0.500 * 4) / (2 + 4),
                (0.251 * 2 + 0.501 * 4) / (2 + 4),
                (0.252 * 2 + 0.502 * 4) / (2 + 4),
            ], new Date("2025-09-15"), 6],
            [[0.750, 0.751, 0.752], new Date("2025-09-16"), 3],
        ]);
    });
});
