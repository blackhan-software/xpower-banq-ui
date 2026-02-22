import { describe, it, expect } from "vitest";
import OHLCData from "./ohlc-data.js";

describe("OHLCData.inter", () => {
    it("should inter daily |serie| = 0", () => {
        expect(OHLCData.inter([])).toEqual([]);
    });
    it("should inter daily |serie| = 1", () => {
        const serie: OHLCData[] = [
            { o: 100, h: 110, l: 95, c: 105, t: new Date("2025-09-15"), n: 10 },
        ];
        expect(OHLCData.inter(serie)).toEqual(serie);
    });
    it("should inter daily |serie| = 2", () => {
        const serie: OHLCData[] = [
            { o: 100, h: 110, l: 95, c: 105, t: new Date("2025-09-15"), n: 10 },
            { o: 105, h: 120, l: 100, c: 115, t: new Date("2025-09-20"), n: 15 },
        ];
        expect(OHLCData.inter(serie)).toEqual([
            { o: 100, h: 110, l: 95, c: 105, t: new Date("2025-09-15"), n: 10 },
            { o: 105, h: 120, l: 100, c: 115, t: new Date("2025-09-16"), n: 0 }, // inter
            { o: 105, h: 120, l: 100, c: 115, t: new Date("2025-09-17"), n: 0 }, // inter
            { o: 105, h: 120, l: 100, c: 115, t: new Date("2025-09-18"), n: 0 }, // inter
            { o: 105, h: 120, l: 100, c: 115, t: new Date("2025-09-19"), n: 0 }, // inter
            { o: 105, h: 120, l: 100, c: 115, t: new Date("2025-09-20"), n: 15 },
        ]);
    });
    it("should inter daily |serie| = 3", () => {
        const serie: OHLCData[] = [
            { o: 100, h: 110, l: 95, c: 105, t: new Date("2025-09-15"), n: 10 },
            { o: 105, h: 120, l: 100, c: 115, t: new Date("2025-09-20"), n: 15 },
            { o: 115, h: 130, l: 110, c: 125, t: new Date("2025-09-30"), n: 20 },
        ];
        expect(OHLCData.inter(serie)).toEqual([
            { o: 100, h: 110, l: 95, c: 105, t: new Date("2025-09-15"), n: 10 },
            { o: 105, h: 120, l: 100, c: 115, t: new Date("2025-09-16"), n: 0 }, // inter
            { o: 105, h: 120, l: 100, c: 115, t: new Date("2025-09-17"), n: 0 }, // inter
            { o: 105, h: 120, l: 100, c: 115, t: new Date("2025-09-18"), n: 0 }, // inter
            { o: 105, h: 120, l: 100, c: 115, t: new Date("2025-09-19"), n: 0 }, // inter
            { o: 105, h: 120, l: 100, c: 115, t: new Date("2025-09-20"), n: 15 },
            { o: 115, h: 130, l: 110, c: 125, t: new Date("2025-09-21"), n: 0 }, // inter
            { o: 115, h: 130, l: 110, c: 125, t: new Date("2025-09-22"), n: 0 }, // inter
            { o: 115, h: 130, l: 110, c: 125, t: new Date("2025-09-23"), n: 0 }, // inter
            { o: 115, h: 130, l: 110, c: 125, t: new Date("2025-09-24"), n: 0 }, // inter
            { o: 115, h: 130, l: 110, c: 125, t: new Date("2025-09-25"), n: 0 }, // inter
            { o: 115, h: 130, l: 110, c: 125, t: new Date("2025-09-26"), n: 0 }, // inter
            { o: 115, h: 130, l: 110, c: 125, t: new Date("2025-09-27"), n: 0 }, // inter
            { o: 115, h: 130, l: 110, c: 125, t: new Date("2025-09-28"), n: 0 }, // inter
            { o: 115, h: 130, l: 110, c: 125, t: new Date("2025-09-29"), n: 0 }, // inter
            { o: 115, h: 130, l: 110, c: 125, t: new Date("2025-09-30"), n: 20 },
        ]);
    });
});

describe("OHLCData.extra", () => {
    const range = {
        lhs: new Date("2025-09-15"),
        rhs: new Date("2025-09-30"),
    };
    it("should extra daily |serie| = 0", () => {
        expect(OHLCData.extra([], range)).toEqual([]);
    });
    it("should extra daily |serie| = 1", () => {
        const serie: OHLCData[] = [
            { o: 100, h: 110, l: 95, c: 105, t: new Date("2025-09-15"), n: 10 },
        ];
        expect(OHLCData.extra(serie, range)).toEqual([
            { o: 100, h: 110, l: 95, c: 105, t: new Date("2025-09-15"), n: 10 },
            { o: 105, h: 105, l: 105, c: 105, t: new Date("2025-09-16"), n: 0 }, // extra
            { o: 105, h: 105, l: 105, c: 105, t: new Date("2025-09-17"), n: 0 }, // extra
            { o: 105, h: 105, l: 105, c: 105, t: new Date("2025-09-18"), n: 0 }, // extra
            { o: 105, h: 105, l: 105, c: 105, t: new Date("2025-09-19"), n: 0 }, // extra
            { o: 105, h: 105, l: 105, c: 105, t: new Date("2025-09-20"), n: 0 }, // extra
            { o: 105, h: 105, l: 105, c: 105, t: new Date("2025-09-21"), n: 0 }, // extra
            { o: 105, h: 105, l: 105, c: 105, t: new Date("2025-09-22"), n: 0 }, // extra
            { o: 105, h: 105, l: 105, c: 105, t: new Date("2025-09-23"), n: 0 }, // extra
            { o: 105, h: 105, l: 105, c: 105, t: new Date("2025-09-24"), n: 0 }, // extra
            { o: 105, h: 105, l: 105, c: 105, t: new Date("2025-09-25"), n: 0 }, // extra
            { o: 105, h: 105, l: 105, c: 105, t: new Date("2025-09-26"), n: 0 }, // extra
            { o: 105, h: 105, l: 105, c: 105, t: new Date("2025-09-27"), n: 0 }, // extra
            { o: 105, h: 105, l: 105, c: 105, t: new Date("2025-09-28"), n: 0 }, // extra
            { o: 105, h: 105, l: 105, c: 105, t: new Date("2025-09-29"), n: 0 }, // extra
            { o: 105, h: 105, l: 105, c: 105, t: new Date("2025-09-30"), n: 0 }, // extra
        ]);
    });
    it("should extra daily |serie| = 2", () => {
        const serie: OHLCData[] = [
            { o: 100, h: 110, l: 95, c: 105, t: new Date("2025-09-15"), n: 10 },
            { o: 105, h: 120, l: 100, c: 115, t: new Date("2025-09-20"), n: 15 },
        ];
        expect(OHLCData.extra(serie, range)).toEqual([
            { o: 100, h: 110, l: 95, c: 105, t: new Date("2025-09-15"), n: 10 },
            { o: 105, h: 120, l: 100, c: 115, t: new Date("2025-09-20"), n: 15 },
            { o: 115, h: 115, l: 115, c: 115, t: new Date("2025-09-21"), n: 0 }, // extra
            { o: 115, h: 115, l: 115, c: 115, t: new Date("2025-09-22"), n: 0 }, // extra
            { o: 115, h: 115, l: 115, c: 115, t: new Date("2025-09-23"), n: 0 }, // extra
            { o: 115, h: 115, l: 115, c: 115, t: new Date("2025-09-24"), n: 0 }, // extra
            { o: 115, h: 115, l: 115, c: 115, t: new Date("2025-09-25"), n: 0 }, // extra
            { o: 115, h: 115, l: 115, c: 115, t: new Date("2025-09-26"), n: 0 }, // extra
            { o: 115, h: 115, l: 115, c: 115, t: new Date("2025-09-27"), n: 0 }, // extra
            { o: 115, h: 115, l: 115, c: 115, t: new Date("2025-09-28"), n: 0 }, // extra
            { o: 115, h: 115, l: 115, c: 115, t: new Date("2025-09-29"), n: 0 }, // extra
            { o: 115, h: 115, l: 115, c: 115, t: new Date("2025-09-30"), n: 0 }, // extra
        ]);
    });
    it("should extra daily |serie| = 3", () => {
        const serie: OHLCData[] = [
            { o: 100, h: 110, l: 95, c: 105, t: new Date("2025-09-15"), n: 10 },
            { o: 105, h: 120, l: 100, c: 115, t: new Date("2025-09-20"), n: 15 },
            { o: 115, h: 130, l: 110, c: 125, t: new Date("2025-09-30"), n: 20 },
        ];
        expect(OHLCData.extra(serie, range)).toEqual([
            { o: 100, h: 110, l: 95, c: 105, t: new Date("2025-09-15"), n: 10 },
            { o: 105, h: 120, l: 100, c: 115, t: new Date("2025-09-20"), n: 15 },
            { o: 115, h: 130, l: 110, c: 125, t: new Date("2025-09-30"), n: 20 },
        ]);
    });
    it("should extra daily before lhs boundary", () => {
        const serie: OHLCData[] = [
            { o: 105, h: 120, l: 100, c: 115, t: new Date("2025-09-20"), n: 15 },
        ];
        expect(OHLCData.extra(serie, range)).toEqual([
            { o: 105, h: 120, l: 100, c: 115, t: new Date("2025-09-15"), n: 0 }, // extra
            { o: 105, h: 120, l: 100, c: 115, t: new Date("2025-09-16"), n: 0 }, // extra
            { o: 105, h: 120, l: 100, c: 115, t: new Date("2025-09-17"), n: 0 }, // extra
            { o: 105, h: 120, l: 100, c: 115, t: new Date("2025-09-18"), n: 0 }, // extra
            { o: 105, h: 120, l: 100, c: 115, t: new Date("2025-09-19"), n: 0 }, // extra
            { o: 105, h: 120, l: 100, c: 115, t: new Date("2025-09-20"), n: 15 },
            { o: 115, h: 115, l: 115, c: 115, t: new Date("2025-09-21"), n: 0 }, // extra
            { o: 115, h: 115, l: 115, c: 115, t: new Date("2025-09-22"), n: 0 }, // extra
            { o: 115, h: 115, l: 115, c: 115, t: new Date("2025-09-23"), n: 0 }, // extra
            { o: 115, h: 115, l: 115, c: 115, t: new Date("2025-09-24"), n: 0 }, // extra
            { o: 115, h: 115, l: 115, c: 115, t: new Date("2025-09-25"), n: 0 }, // extra
            { o: 115, h: 115, l: 115, c: 115, t: new Date("2025-09-26"), n: 0 }, // extra
            { o: 115, h: 115, l: 115, c: 115, t: new Date("2025-09-27"), n: 0 }, // extra
            { o: 115, h: 115, l: 115, c: 115, t: new Date("2025-09-28"), n: 0 }, // extra
            { o: 115, h: 115, l: 115, c: 115, t: new Date("2025-09-29"), n: 0 }, // extra
            { o: 115, h: 115, l: 115, c: 115, t: new Date("2025-09-30"), n: 0 }, // extra
        ]);
    });
});

describe("OHLCData.clip", () => {
    const range = {
        lhs: new Date("2025-09-15"),
        rhs: new Date("2025-09-30"),
    };
    it("should clip daily |serie| = 0", () => {
        expect(OHLCData.clip([], range)).toEqual([]);
    });
    it("should clip daily |serie| = 1", () => {
        const serie: OHLCData[] = [
            { o: 100, h: 110, l: 95, c: 105, t: new Date("2025-09-15"), n: 10 },
        ];
        expect(OHLCData.clip(serie, range)).toEqual(serie);
    });
    it("should clip daily |serie| = 2", () => {
        const serie: OHLCData[] = [
            { o: 90, h: 100, l: 85, c: 95, t: new Date("2025-09-10"), n: 5 }, // clip
            { o: 105, h: 120, l: 100, c: 115, t: new Date("2025-09-20"), n: 15 },
        ];
        expect(OHLCData.clip(serie, range)).toEqual([
            { o: 105, h: 120, l: 100, c: 115, t: new Date("2025-09-20"), n: 15 },
        ]);
    });
    it("should clip daily |serie| = 3", () => {
        const serie: OHLCData[] = [
            { o: 90, h: 100, l: 85, c: 95, t: new Date("2025-09-10"), n: 5 }, // clip
            { o: 105, h: 120, l: 100, c: 115, t: new Date("2025-09-20"), n: 15 },
            { o: 125, h: 140, l: 120, c: 135, t: new Date("2025-10-01"), n: 25 }, // clip
        ];
        expect(OHLCData.clip(serie, range)).toEqual([
            { o: 105, h: 120, l: 100, c: 115, t: new Date("2025-09-20"), n: 15 },
        ]);
    });
    it("should clip daily keep boundary dates", () => {
        const serie: OHLCData[] = [
            { o: 100, h: 110, l: 95, c: 105, t: new Date("2025-09-15"), n: 10 },
            { o: 105, h: 120, l: 100, c: 115, t: new Date("2025-09-20"), n: 15 },
            { o: 115, h: 130, l: 110, c: 125, t: new Date("2025-09-30"), n: 20 },
        ];
        expect(OHLCData.clip(serie, range)).toEqual(serie);
    });
    it("should clip daily exclude out of range", () => {
        const serie: OHLCData[] = [
            { o: 90, h: 100, l: 85, c: 95, t: new Date("2025-09-10"), n: 5 }, // clip
            { o: 100, h: 110, l: 95, c: 105, t: new Date("2025-09-15"), n: 10 },
            { o: 105, h: 120, l: 100, c: 115, t: new Date("2025-09-20"), n: 15 },
            { o: 115, h: 130, l: 110, c: 125, t: new Date("2025-09-30"), n: 20 },
            { o: 125, h: 140, l: 120, c: 135, t: new Date("2025-10-05"), n: 25 }, // clip
        ];
        expect(OHLCData.clip(serie, range)).toEqual([
            { o: 100, h: 110, l: 95, c: 105, t: new Date("2025-09-15"), n: 10 },
            { o: 105, h: 120, l: 100, c: 115, t: new Date("2025-09-20"), n: 15 },
            { o: 115, h: 130, l: 110, c: 125, t: new Date("2025-09-30"), n: 20 },
        ]);
    });
});
