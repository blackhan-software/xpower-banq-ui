// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { stubGlobals } from "@/test";

stubGlobals();

vi.mock("@/constant", async () => ({
    ...(await import("@/test/constants")).MOCK_CONSTANTS,
    GLOBAL: globalThis,
}));
vi.mock("@/function", async (importOriginal) =>
    (await import("@/test")).mockFunction(importOriginal)
);

const MOCK_POOL_ACCOUNT = { pool: 300n, account: 1n };

vi.mock("./use-pool-account", () => ({
    usePoolAccount: () => [MOCK_POOL_ACCOUNT] as const,
}));
vi.mock("./use-oracle-quote", () => ({
    useOracleQuote: () => [null] as const,
}));

const mockSetPortfolioYields = vi.fn();
let mockPortfolioYields: Map<typeof MOCK_POOL_ACCOUNT, number> | null = null;

vi.mock("@/zustand", () => ({
    appStore: () => ({
        portfolio_yields: mockPortfolioYields,
        set_portfolio_yields: mockSetPortfolioYields,
    }),
}));

import { usePortfolioYield } from "./use-portfolio-yield";

describe("usePortfolioYield", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockPortfolioYields = new Map();
    });

    it("should return [null] when no yield for pool account", () => {
        const { result } = renderHook(() => usePortfolioYield());
        expect(result.current[0]).toBeNull();
    });

    it("should return yield when present in map", () => {
        mockPortfolioYields = new Map();
        mockPortfolioYields.set(MOCK_POOL_ACCOUNT, 0.05);
        const { result } = renderHook(() => usePortfolioYield());
        expect(result.current[0]).toBe(0.05);
    });

    it("should return [null] when portfolio_yields is null", () => {
        mockPortfolioYields = null;
        const { result } = renderHook(() => usePortfolioYield());
        expect(result.current[0]).toBeNull();
    });

    it("should handle Array-type portfolio_yields (deserialized)", () => {
        (mockPortfolioYields as any) = [
            [MOCK_POOL_ACCOUNT, 0.12],
        ];
        const { result } = renderHook(() => usePortfolioYield());
        expect(result.current[0]).toBe(0.12);
    });
});
