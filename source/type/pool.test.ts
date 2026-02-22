import { describe, expect, it, vi } from "vitest";
import { stubGlobals } from "@/test";

stubGlobals();

vi.mock("@/constant", async () =>
    (await import("@/test/constants")).MOCK_CONSTANTS
);
vi.mock("@/function", async (importOriginal) =>
    (await import("@/test")).mockFunction(importOriginal)
);

import { Pool } from "@/type";

describe("Pool.from", () => {
    it("should find pool by name", () => {
        const pool = Pool.from("APOW:XPOW");
        expect(pool).toBe(300n);
    });
    it("should find another pool by name", () => {
        const pool = Pool.from("XPOW:USDC");
        expect(pool).toBe(305n);
    });
    it("should return 0n for unknown name", () => {
        const pool = Pool.from("UNKNOWN:POOL");
        expect(pool).toBe(0n);
    });
    it("should cache results", () => {
        const a = Pool.from("APOW:AVAX");
        const b = Pool.from("APOW:AVAX");
        expect(a).toBe(b);
    });
});
describe("Pool.name", () => {
    it("should return name for known pool", () => {
        expect(Pool.name(300n)).toBe("APOW:XPOW");
    });
    it("should return name for another pool", () => {
        expect(Pool.name(306n)).toBe("XPOW:USDt");
    });
    it("should return '---' for unknown pool", () => {
        expect(Pool.name(999n)).toBe("---");
    });
    it("should cache results", () => {
        const a = Pool.name(301n);
        const b = Pool.name(301n);
        expect(a).toBe(b);
    });
});
describe("Pool.token", () => {
    it("should return first token by default", () => {
        const token = Pool.token(300n);
        expect(token).toBe("0x0000000000000000000000000000000000000064"); // APOW=100n
    });
    it("should return second token by index", () => {
        const token = Pool.token(300n, 1);
        expect(token).toBe("0x0000000000000000000000000000000000000065"); // XPOW=101n
    });
    it("should return null for out-of-bounds index", () => {
        expect(Pool.token(300n, 99)).toBeNull();
    });
    it("should return null for unknown pool", () => {
        expect(Pool.token(999n)).toBeNull();
    });
});
describe("Pool.tokens", () => {
    it("should return token array for known pool", () => {
        const tokens = Pool.tokens(300n);
        expect(tokens).toHaveLength(2);
    });
    it("should return null for unknown pool", () => {
        expect(Pool.tokens(999n)).toBeNull();
    });
    it("should return correct tokens for APOW:AVAX pool", () => {
        const tokens = Pool.tokens(301n);
        expect(tokens).toHaveLength(2);
        expect(tokens?.[0]).toBe("0x0000000000000000000000000000000000000064"); // APOW
        expect(tokens?.[1]).toBe("0x0000000000000000000000000000000000000066"); // AVAX=102n
    });
});
