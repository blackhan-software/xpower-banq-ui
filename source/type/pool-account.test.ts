import { describe, expect, it, vi } from "vitest";
import { stubGlobals } from "@/test";

stubGlobals();

vi.mock("@/constant", async () =>
    (await import("@/test/constants")).MOCK_CONSTANTS
);
vi.mock("@/function", async (importOriginal) =>
    (await import("@/test")).mockFunction(importOriginal)
);

import { PoolAccount } from "@/type";
import { MOCK_CONSTANTS } from "@/test/constants";

const POOL = MOCK_CONSTANTS.P000_ADDRESS;
const ACCOUNT = 0xABCn;

describe("PoolAccount.from", () => {
    it("should create a PoolAccount instance", () => {
        const pa = PoolAccount.from(POOL, ACCOUNT);
        expect(pa.pool).toBe(POOL);
        expect(pa.account).toBe(ACCOUNT);
    });
    it("should return same reference (flyweight)", () => {
        const a = PoolAccount.from(POOL, ACCOUNT);
        const b = PoolAccount.from(POOL, ACCOUNT);
        expect(a).toBe(b);
    });
    it("should return different references for different accounts", () => {
        const a = PoolAccount.from(POOL, 1n);
        const b = PoolAccount.from(POOL, 2n);
        expect(a).not.toBe(b);
    });
});
describe("PoolAccount.map", () => {
    it("should convert Array to Map with flyweight keys", () => {
        const pa = PoolAccount.from(POOL, ACCOUNT);
        const arr: [typeof pa, string][] = [[pa, "value"]];
        const map = PoolAccount.map(arr);
        expect(map).toBeInstanceOf(Map);
        expect(map!.get(pa)).toBe("value");
    });
    it("should return null for null input", () => {
        expect(PoolAccount.map(null)).toBeNull();
    });
});
