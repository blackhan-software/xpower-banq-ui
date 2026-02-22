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

const TOKEN_A = "0x000000000000000000000000000000000000000a";
const TOKEN_B = "0x000000000000000000000000000000000000000b";

const mockTotalSupply = vi.fn().mockResolvedValue(1000n);

let mockSupplyPositionMap: Map<any, any> | null = null;
let mockBorrowPositionMap: Map<any, any> | null = null;

vi.mock("@/react/hook", () => ({
    usePoolTokens: () => [[TOKEN_A, TOKEN_B]] as const,
    usePositionContracts: (mode: string) => {
        if (mode === "supply") return [mockSupplyPositionMap] as const;
        return [mockBorrowPositionMap] as const;
    },
}));

const mockSetPoolSupply = vi.fn();
const mockSetPoolBorrow = vi.fn();
let mockPoolSupply: Map<any, any> | null = null;
let mockPoolBorrow: Map<any, any> | null = null;

vi.mock("@/zustand", () => ({
    appStore: () => ({
        pool: 300n,
        pool_supply: mockPoolSupply,
        set_pool_supply: mockSetPoolSupply,
        pool_borrow: mockPoolBorrow,
        set_pool_borrow: mockSetPoolBorrow,
    }),
}));

import { usePoolTotals } from "./use-pool-totals";
import { PoolToken } from "@/type";

function buildPositionMap() {
    const ptA = PoolToken.from(300n, TOKEN_A);
    const ptB = PoolToken.from(300n, TOKEN_B);
    const map = new Map();
    map.set(ptA, { target: "0xA", totalSupply: mockTotalSupply });
    map.set(ptB, { target: "0xB", totalSupply: mockTotalSupply });
    return map;
}

describe("usePoolTotals", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockPoolSupply = new Map();
        mockPoolBorrow = new Map();
        const posMap = buildPositionMap();
        mockSupplyPositionMap = posMap;
        mockBorrowPositionMap = posMap;
        mockTotalSupply.mockResolvedValue(1000n);
    });

    it("should return { supply, borrow }", () => {
        const { result } = renderHook(
            () => usePoolTotals(),
            { wrapper: createWrapper() },
        );
        expect(result.current).toHaveProperty("supply");
        expect(result.current).toHaveProperty("borrow");
    });

    it("should fetch totalSupply for supply positions", async () => {
        renderHook(
            () => usePoolTotals(),
            { wrapper: createWrapper() },
        );
        await waitFor(() => {
            expect(mockTotalSupply).toHaveBeenCalled();
        });
    });

    it("should update store with supply totals", async () => {
        renderHook(
            () => usePoolTotals(),
            { wrapper: createWrapper() },
        );
        await waitFor(() => {
            expect(mockSetPoolSupply).toHaveBeenCalled();
        });
    });

    it("should update store with borrow totals", async () => {
        renderHook(
            () => usePoolTotals(),
            { wrapper: createWrapper() },
        );
        await waitFor(() => {
            expect(mockSetPoolBorrow).toHaveBeenCalled();
        });
    });

    it("should handle null position maps gracefully", () => {
        mockSupplyPositionMap = null;
        mockBorrowPositionMap = null;
        const { result } = renderHook(
            () => usePoolTotals(),
            { wrapper: createWrapper() },
        );
        expect(mockTotalSupply).not.toHaveBeenCalled();
        expect(result.current.supply).toBeInstanceOf(Map);
    });

    it("should handle Array-type pool_supply (deserialized)", () => {
        (mockPoolSupply as any) = [];
        const { result } = renderHook(
            () => usePoolTotals(),
            { wrapper: createWrapper() },
        );
        expect(result.current.supply).toBeInstanceOf(Map);
    });
});
