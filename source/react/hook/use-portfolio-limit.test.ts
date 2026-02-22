// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { stubGlobals } from "@/test";

stubGlobals();

vi.mock("@/constant", async () => ({
    ...(await import("@/test/constants")).MOCK_CONSTANTS,
    GLOBAL: globalThis,
    U224: 2n ** 224n - 1n,
    U256: 2n ** 256n - 1n,
    UNIT: 1e18,
}));
vi.mock("@/function", async (importOriginal) =>
    (await import("@/test")).mockFunction(importOriginal)
);

const ADDR_A = "0x000000000000000000000000000000000000000a";
const MOCK_TOKEN = {
    address: ADDR_A, decimals: 18n, supply: 0n, symbol: "APOW",
};
const MOCK_POOL_ACCOUNT = { pool: 300n, account: 1n };

let mockCap: [number, number] | null = [10.0, 0];
vi.mock("@/react/hook", () => ({
    useTellerToken: () => [MOCK_TOKEN] as const,
    usePoolAccount: () => [MOCK_POOL_ACCOUNT] as const,
    usePortfolioCap: () => [mockCap] as const,
}));

const mockSetPortfolioLimits = vi.fn();
let mockPortfolioLimits: Map<typeof MOCK_POOL_ACCOUNT, any[]> | null = null;

vi.mock("@/zustand", () => ({
    appStore: () => ({
        portfolio_limits: mockPortfolioLimits,
        set_portfolio_limits: mockSetPortfolioLimits,
    }),
}));

import { usePortfolioLimit } from "./use-portfolio-limit";

describe("usePortfolioLimit", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockCap = [10.0, 0];
        mockPortfolioLimits = new Map();
        mockPortfolioLimits.set(MOCK_POOL_ACCOUNT, [
            { amount: 5.0, token: MOCK_TOKEN },
        ]);
    });

    it("should return [null] when cap is null", () => {
        mockCap = null;
        const { result } = renderHook(() => usePortfolioLimit());
        expect(result.current[0]).toBeNull();
    });

    it("should return [null] when limits map is null", () => {
        mockPortfolioLimits = null;
        const { result } = renderHook(() => usePortfolioLimit());
        expect(result.current[0]).toBeNull();
    });

    it("should return [null] when no limits for pool account", () => {
        mockPortfolioLimits = new Map();
        const { result } = renderHook(() => usePortfolioLimit());
        expect(result.current[0]).toBeNull();
    });

    it("should return [null] when token not found in limits", () => {
        const otherToken = {
            ...MOCK_TOKEN,
            address: "0x000000000000000000000000000000000000000b",
        };
        mockPortfolioLimits = new Map();
        mockPortfolioLimits.set(MOCK_POOL_ACCOUNT, [
            { amount: 5.0, token: otherToken },
        ]);
        const { result } = renderHook(() => usePortfolioLimit());
        expect(result.current[0]).toBeNull();
    });

    it("should return min(cap, limit) when limit < cap", () => {
        // cap = 10.0, limit = 5.0 => min = 5.0
        const { result } = renderHook(() => usePortfolioLimit());
        expect(result.current[0]).toBe(5.0);
    });

    it("should return cap when cap < limit", () => {
        mockCap = [3.0, 0];
        // cap = 3.0, limit = 5.0 => min = 3.0
        const { result } = renderHook(() => usePortfolioLimit());
        expect(result.current[0]).toBe(3.0);
    });

    it("should handle Array-type portfolio_limits (deserialized)", () => {
        // Simulate sessionStorage deserialization (Array instead of Map)
        (mockPortfolioLimits as any) = [
            [MOCK_POOL_ACCOUNT, [{ amount: 7.0, token: MOCK_TOKEN }]],
        ];
        const { result } = renderHook(() => usePortfolioLimit());
        expect(result.current[0]).toBe(7.0);
    });
});
