// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { stubGlobals, createWrapper } from "@/test";

stubGlobals();

vi.mock("@/constant", async () => ({
    ...(await import("@/test/constants")).MOCK_CONSTANTS,
    GLOBAL: globalThis,
}));
vi.mock("@/function", async (importOriginal) =>
    (await import("@/test")).mockFunction(importOriginal)
);

const MOCK_POOL_ACCOUNT = { pool: 300n, account: 1n };
const mockHealthOf = vi.fn().mockResolvedValue([100n, 200n]);

vi.mock("@/react/hook", () => ({
    usePoolAccount: () => [MOCK_POOL_ACCOUNT] as const,
    usePoolContract: () => [{
        target: "0x0001",
        healthOf: mockHealthOf,
    }] as const,
}));

const mockSetPortfolioHealth = vi.fn();
let mockPortfolioHealth: Map<typeof MOCK_POOL_ACCOUNT, any> | null = null;

vi.mock("@/zustand", () => ({
    appStore: () => ({
        portfolio_health: mockPortfolioHealth,
        set_portfolio_health: mockSetPortfolioHealth,
    }),
}));

import { usePortfolioHealth } from "./use-portfolio-health";

describe("usePortfolioHealth", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockPortfolioHealth = new Map();
    });

    it("should return [null] when no health for pool account", () => {
        const { result } = renderHook(
            () => usePortfolioHealth(),
            { wrapper: createWrapper() },
        );
        expect(result.current[0]).toBeNull();
    });

    it("should return health when present in map", () => {
        const health = { borrow: 100n, supply: 200n };
        mockPortfolioHealth = new Map();
        mockPortfolioHealth.set(MOCK_POOL_ACCOUNT, health);
        const { result } = renderHook(
            () => usePortfolioHealth(),
            { wrapper: createWrapper() },
        );
        expect(result.current[0]).toEqual(health);
    });

    it("should fetch health via pool contract", async () => {
        renderHook(
            () => usePortfolioHealth(),
            { wrapper: createWrapper() },
        );
        await waitFor(() => {
            expect(mockHealthOf).toHaveBeenCalled();
        });
    });

    it("should update store with fetched health", async () => {
        renderHook(
            () => usePortfolioHealth(),
            { wrapper: createWrapper() },
        );
        await waitFor(() => {
            expect(mockSetPortfolioHealth).toHaveBeenCalled();
        });
        const call = mockSetPortfolioHealth.mock.calls[0]![0];
        expect(call).toBeInstanceOf(Map);
        const health = call.get(MOCK_POOL_ACCOUNT);
        expect(health).toEqual({ borrow: 100n, supply: 200n });
    });

    it("should return [null] when portfolio_health is null", () => {
        mockPortfolioHealth = null;
        const { result } = renderHook(
            () => usePortfolioHealth(),
            { wrapper: createWrapper() },
        );
        expect(result.current[0]).toBeNull();
    });
});
