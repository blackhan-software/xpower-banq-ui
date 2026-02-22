import { describe, expect, it, vi } from "vitest";
import { stubGlobals } from "@/test";

stubGlobals();

vi.mock("@/constant", async () => ({
    ...(await import("@/test/constants")).MOCK_CONSTANTS,
    UNIT: 1e18,
}));
vi.mock("@/function", async (importOriginal) =>
    (await import("@/test")).mockFunction(importOriginal)
);

import { RateInfo, RateModel } from "@/type";

const UNIT = 1e18;

describe("RateInfo.init", () => {
    it("should return zero rate info", () => {
        expect(RateInfo.init()).toEqual({
            util: { value: 0 },
            sura: 0,
            bora: 0,
        });
    });
});
describe("RateInfo.from", () => {
    it("should return zero rates at zero utilization", () => {
        const model: RateModel = { rate: 0.5 * UNIT, spread: 0.01 * UNIT, util: 0.1 * UNIT };
        const info = RateInfo.from({ value: 0 }, model);
        expect(info.util.value).toBe(0);
        expect(info.sura).toBe(0);
        expect(info.bora).toBe(0);
    });
    it("should compute rates at optimal utilization", () => {
        const model: RateModel = { rate: 0.5 * UNIT, spread: 0.01 * UNIT, util: 0.1 * UNIT };
        const info = RateInfo.from({ value: 0.1 * UNIT }, model);
        // at optimal: rate = rate_optimal = 0.5 * UNIT
        // supply_rate = rate * (1 - spread) / UNIT = 0.5 * 0.99 = 0.495 * UNIT
        // borrow_rate = rate * (1 + spread) / UNIT = 0.5 * 1.01 = 0.505 * UNIT
        expect(info.sura).toBe(0.495 * UNIT);
        expect(info.bora).toBe(0.505 * UNIT);
    });
    it("should compute rates below optimal utilization", () => {
        const model: RateModel = { rate: 0.5 * UNIT, spread: 0.01 * UNIT, util: 0.2 * UNIT };
        const info = RateInfo.from({ value: 0.1 * UNIT }, model);
        // below optimal: rate = util * rate_optimal / util_optimal = 0.1 * 0.5 / 0.2 = 0.25
        // supply = 0.25 * UNIT * (1 - 0.01) / UNIT = 0.2475 * UNIT
        // borrow = 0.25 * UNIT * (1 + 0.01) / UNIT = 0.2525 * UNIT
        const expected_rate = (0.1 * UNIT * 0.5 * UNIT) / (0.2 * UNIT);
        const expected_sura = (expected_rate * (UNIT - 0.01 * UNIT)) / UNIT;
        const expected_bora = (expected_rate * (UNIT + 0.01 * UNIT)) / UNIT;
        expect(info.sura).toBe(expected_sura);
        expect(info.bora).toBe(expected_bora);
    });
    it("should compute rates above optimal utilization", () => {
        const model: RateModel = { rate: 0.5 * UNIT, spread: 0, util: 0.1 * UNIT };
        const info = RateInfo.from({ value: 0.5 * UNIT }, model);
        // above optimal: rate_by = (u * (1-R) - 1 * (U-R)) / (1-U)
        const u = 0.5 * UNIT;
        const d1U = UNIT - 0.1 * UNIT;  // 0.9
        const d1R = UNIT - 0.5 * UNIT;  // 0.5
        const dUR = 0.1 * UNIT - 0.5 * UNIT; // -0.4
        const rate = (u * d1R - UNIT * dUR) / d1U;
        // spread = 0, so sura = bora = rate
        expect(info.sura).toBe(rate);
        expect(info.bora).toBe(rate);
    });
    it("should compute rates at full utilization with zero spread", () => {
        const model: RateModel = { rate: 0.5 * UNIT, spread: 0, util: 0.5 * UNIT };
        const info = RateInfo.from({ value: UNIT }, model);
        // at 100% util: rate_by = (1 * (1-R) - 1 * (U-R)) / (1-U)
        // = (1 * 0.5 - 1 * 0) / 0.5 = 0.5/0.5 = 1
        const u = UNIT;
        const d1U = UNIT - 0.5 * UNIT;
        const d1R = UNIT - 0.5 * UNIT;
        const dUR = 0.5 * UNIT - 0.5 * UNIT;
        const rate = (u * d1R - UNIT * dUR) / d1U;
        expect(info.sura).toBe(rate);
        expect(info.bora).toBe(rate);
    });
    it("should apply spread symmetrically", () => {
        const spread = 0.05 * UNIT; // 5%
        const model: RateModel = { rate: 0.5 * UNIT, spread, util: 0.1 * UNIT };
        const info = RateInfo.from({ value: 0.1 * UNIT }, model);
        // at optimal: base_rate = 0.5 * UNIT
        // sura = base * (1 - spread) = 0.5 * 0.95 = 0.475
        // bora = base * (1 + spread) = 0.5 * 1.05 = 0.525
        const base_rate = 0.5 * UNIT;
        expect(info.sura).toBe((base_rate * (UNIT - spread)) / UNIT);
        expect(info.bora).toBe((base_rate * (UNIT + spread)) / UNIT);
        // borrow rate should always exceed supply rate
        expect(info.bora).toBeGreaterThan(info.sura);
    });
    it("should preserve utilization in result", () => {
        const model: RateModel = { rate: 0.5 * UNIT, spread: 0, util: 0.1 * UNIT };
        const util = { value: 42 };
        const info = RateInfo.from(util, model);
        expect(info.util).toBe(util);
    });
});
