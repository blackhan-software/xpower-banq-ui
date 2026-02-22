import { describe, expect, it, vi } from "vitest";
import { stubGlobals } from "@/test";

stubGlobals();

vi.mock("@/constant", async () =>
    (await import("@/test/constants")).MOCK_CONSTANTS
);
vi.mock("@/function", async (importOriginal) =>
    (await import("@/test")).mockFunction(importOriginal)
);

import { PoolToken, Symbol, Tokens } from "@/type";
import { MOCK_CONSTANTS } from "@/test/constants";

const POOL = MOCK_CONSTANTS.P000_ADDRESS;
const TOKEN = Tokens[Symbol.APOW];

describe("PoolToken.from", () => {
    it("should create a PoolToken instance", () => {
        const pt = PoolToken.from(POOL, TOKEN);
        expect(pt.pool).toBe(POOL);
        expect(pt.token).toBe(TOKEN);
    });
    it("should return same reference (flyweight)", () => {
        const a = PoolToken.from(POOL, TOKEN);
        const b = PoolToken.from(POOL, TOKEN);
        expect(a).toBe(b);
    });
    it("should return different references for different pools", () => {
        const a = PoolToken.from(MOCK_CONSTANTS.P000_ADDRESS, TOKEN);
        const b = PoolToken.from(MOCK_CONSTANTS.P001_ADDRESS, TOKEN);
        expect(a).not.toBe(b);
    });
});
describe("PoolToken.map", () => {
    it("should convert Array to Map with flyweight keys", () => {
        const pt = PoolToken.from(POOL, TOKEN);
        const arr: [typeof pt, number][] = [[pt, 42]];
        const map = PoolToken.map(arr);
        expect(map).toBeInstanceOf(Map);
        expect(map!.get(pt)).toBe(42);
    });
    it("should convert Map to Map with flyweight keys", () => {
        const pt = PoolToken.from(POOL, TOKEN);
        const src = new Map([[pt, 99]]);
        const map = PoolToken.map(src);
        expect(map).toBeInstanceOf(Map);
        expect(map!.get(pt)).toBe(99);
    });
    it("should return null for null input", () => {
        expect(PoolToken.map(null)).toBeNull();
    });
});
