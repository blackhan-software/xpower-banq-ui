import { describe, expect, it, vi } from "vitest";
import { stubGlobals } from "@/test";

stubGlobals();

vi.mock("@/constant", async () =>
    (await import("@/test/constants")).MOCK_CONSTANTS
);
vi.mock("@/function", async (importOriginal) =>
    (await import("@/test")).mockFunction(importOriginal)
);

import { PoolList } from "@/type";

describe("PoolList.query", () => {
    it("should return all visible pools", () => {
        const pools = PoolList.query({ visible: true });
        expect(pools.length).toBe(7);
    });
    it("should return pools by name", () => {
        const pools = PoolList.query({ name: "APOW:XPOW" });
        expect(pools).toHaveLength(1);
        expect(pools[0]?.pool).toBe(300n);
    });
    it("should return pools by pool address", () => {
        const pools = PoolList.query({ pool: 305n });
        expect(pools).toHaveLength(1);
        expect(pools[0]?.name).toBe("XPOW:USDC");
    });
    it("should return pools by group", () => {
        const pools = PoolList.query({ group: 0 });
        expect(pools.length).toBe(7);
    });
    it("should return empty for unknown name", () => {
        expect(PoolList.query({ name: "NOPE" })).toHaveLength(0);
    });
    it("should return empty for unknown pool address", () => {
        expect(PoolList.query({ pool: 999n })).toHaveLength(0);
    });
    it("should filter by combined criteria", () => {
        const pools = PoolList.query({ visible: true, name: "APOW:AVAX" });
        expect(pools).toHaveLength(1);
        expect(pools[0]?.pool).toBe(301n);
    });
    it("should exclude named NULL_ADDRESS entries", () => {
        // separator { pool: NULL_ADDRESS, visible: null } has no name,
        // so it passes the final filter (p !== NULL || !n)
        const all = PoolList.query();
        const nulls = all.filter(({ pool }) => pool === 0n);
        // unnamed NULL entries are kept (separator)
        for (const entry of nulls) {
            expect(entry.name).toBeUndefined();
        }
    });
    it("should exclude separator when filtering by visible", () => {
        const pools = PoolList.query({ visible: true });
        const has_null = pools.some(({ pool }) => pool === 0n);
        expect(has_null).toBe(false);
    });
});
describe("PoolList.next", () => {
    it("should return the next pool in the group", () => {
        const next = PoolList.next(300n); // APOW:XPOW → APOW:AVAX
        expect(next).toBe(301n);
    });
    it("should wrap around to first pool", () => {
        const next = PoolList.next(306n); // XPOW:USDt → APOW:XPOW
        expect(next).toBe(300n);
    });
    it("should return null for unknown pool", () => {
        expect(PoolList.next(999n)).toBeNull();
    });
});
describe("PoolList.prev", () => {
    it("should return the previous pool in the group", () => {
        const prev = PoolList.prev(301n); // APOW:AVAX → APOW:XPOW
        expect(prev).toBe(300n);
    });
    it("should wrap around to last pool", () => {
        const prev = PoolList.prev(300n); // APOW:XPOW → XPOW:USDt
        expect(prev).toBe(306n);
    });
    it("should return null for unknown pool", () => {
        expect(PoolList.prev(999n)).toBeNull();
    });
});
describe("PoolList.indexOf", () => {
    it("should return 0 for first pool", () => {
        expect(PoolList.indexOf(300n)).toBe(0);
    });
    it("should return correct index for middle pool", () => {
        expect(PoolList.indexOf(303n)).toBe(3);
    });
    it("should return last index for last pool", () => {
        expect(PoolList.indexOf(306n)).toBe(6);
    });
    it("should return -1 for unknown pool", () => {
        expect(PoolList.indexOf(999n)).toBe(-1);
    });
});
