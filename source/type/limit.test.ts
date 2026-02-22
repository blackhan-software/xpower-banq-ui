import { describe, expect, it, vi } from "vitest";
import { stubGlobals } from "@/test";

stubGlobals();

vi.mock("@/constant", async () =>
    (await import("@/test/constants")).MOCK_CONSTANTS
);
vi.mock("@/function", async (importOriginal) =>
    (await import("@/test")).mockFunction(importOriginal)
);

import { Limit, Symbol, Tokens } from "@/type";

function makeLimits(): Limit[] {
    return [
        { amount: 100, token: Tokens[Symbol.APOW] },
        { amount: 200, token: Tokens[Symbol.XPOW] },
    ];
}

describe("Limit.findBy", () => {
    it("should find limit by token address", () => {
        const limits = makeLimits();
        const found = Limit.findBy(limits, Tokens[Symbol.APOW]);
        expect(found).toBe(limits[0]);
    });
    it("should return undefined for missing token", () => {
        const limits = makeLimits();
        const found = Limit.findBy(limits, Tokens[Symbol.USDC]);
        expect(found).toBeUndefined();
    });
});
describe("Limit.sum", () => {
    it("should return 0 for empty array", () => {
        expect(Limit.sum([])).toBe(0);
    });
    it("should sum limit amounts", () => {
        expect(Limit.sum(makeLimits())).toBe(300);
    });
    it("should handle single limit", () => {
        const limits = [{ amount: 42, token: Tokens[Symbol.APOW] }];
        expect(Limit.sum(limits)).toBe(42);
    });
});
describe("Limit.checksum", () => {
    it("should be deterministic", () => {
        const limits = makeLimits();
        expect(Limit.checksum(limits)).toBe(Limit.checksum(limits));
    });
    it("should return 0 for empty array", () => {
        expect(Limit.checksum([])).toBe(0);
    });
});
describe("Limit.eq", () => {
    it("should return true for equal limits", () => {
        expect(Limit.eq(makeLimits(), makeLimits())).toBe(true);
    });
    it("should return false for different limits", () => {
        const a = makeLimits();
        const b = [{ amount: 999, token: Tokens[Symbol.APOW] }];
        expect(Limit.eq(a, b)).toBe(false);
    });
    it("should handle undefined inputs", () => {
        expect(Limit.eq(undefined, undefined)).toBe(true);
        expect(Limit.eq([], undefined)).toBe(true);
    });
});
