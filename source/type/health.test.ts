import { describe, expect, it, vi } from "vitest";
import { stubGlobals } from "@/test";

stubGlobals();

vi.mock("@/constant", async () =>
    (await import("@/test/constants")).MOCK_CONSTANTS
);
vi.mock("@/function", async (importOriginal) =>
    (await import("@/test")).mockFunction(importOriginal)
);

import { Health, TokenInfo } from "@/type";

describe("Health.from", () => {
    it("should create from a tuple", () => {
        const h = Health.from([100n, 200n]);
        expect(h).toEqual({ borrow: 100n, supply: 200n });
    });
});
describe("Health.init", () => {
    it("should return zero health", () => {
        expect(Health.init()).toEqual({ borrow: 0n, supply: 0n });
    });
});
describe("Health.eq", () => {
    it("should return true for equal health", () => {
        const a = { borrow: 10n, supply: 20n };
        const b = { borrow: 10n, supply: 20n };
        expect(Health.eq(a, b)).toBe(true);
    });
    it("should return false for different borrow", () => {
        const a = { borrow: 10n, supply: 20n };
        const b = { borrow: 11n, supply: 20n };
        expect(Health.eq(a, b)).toBe(false);
    });
    it("should return false for different supply", () => {
        const a = { borrow: 10n, supply: 20n };
        const b = { borrow: 10n, supply: 21n };
        expect(Health.eq(a, b)).toBe(false);
    });
    it("should return true for both undefined", () => {
        expect(Health.eq(undefined, undefined)).toBe(true);
    });
    it("should return false when only lhs is undefined", () => {
        expect(Health.eq(undefined, { borrow: 0n, supply: 0n })).toBe(false);
    });
    it("should return false when only rhs is undefined", () => {
        expect(Health.eq({ borrow: 0n, supply: 0n }, undefined)).toBe(false);
    });
});
describe("Health.ratio", () => {
    it("should return supply / borrow", () => {
        const h = { borrow: 100n, supply: 300n };
        expect(Health.ratio(h)).toBe(3);
    });
    it("should return fractional ratio", () => {
        const h = { borrow: 200n, supply: 100n };
        expect(Health.ratio(h)).toBe(0.5);
    });
    it("should return Infinity when borrow is zero", () => {
        const h = { borrow: 0n, supply: 100n };
        expect(Health.ratio(h)).toBe(Infinity);
    });
    it("should return Infinity for init health", () => {
        expect(Health.ratio(Health.init())).toBe(Infinity);
    });
});
describe("Health.wnav", () => {
    it("should compute weighted NAV with v10a", () => {
        const h = { borrow: 0n, supply: 255n };
        const tokens: TokenInfo[] = [
            { address: "0x0", symbol: "T" as any, decimals: 18n, supply: 0n, weights: [255, 85] },
        ];
        // CONTRACT_RUN = "v10a" → weights_max = 1
        // weights_sum = 255, nav = 255 - 0 = 255
        // result = 255 * 1 * 1 / 255 = 1
        expect(Health.wnav(h, tokens)).toBe(1);
    });
    it("should compute weighted NAV with multiple tokens", () => {
        const h = { borrow: 100n, supply: 610n };
        const tokens: TokenInfo[] = [
            { address: "0x0", symbol: "A" as any, decimals: 18n, supply: 0n, weights: [255, 85] },
            { address: "0x1", symbol: "B" as any, decimals: 18n, supply: 0n, weights: [255, 85] },
        ];
        // weights_sum = 510, nav = 510, tokens.length = 2
        // result = 510 * 2 * 1 / 510 = 2
        expect(Health.wnav(h, tokens)).toBe(2);
    });
});
