// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { stubGlobals } from "@/test";

stubGlobals();

if (!(BigInt.prototype as any).toJSON) {
    (BigInt.prototype as any).toJSON = function () { return this.toString(); };
}

vi.mock("@/constant", async () => ({
    ...(await import("@/test/constants")).MOCK_CONSTANTS,
    GLOBAL: globalThis,
}));
vi.mock("@/function", async (importOriginal) =>
    (await import("@/test")).mockFunction(importOriginal)
);

const TOKEN_A = "0x000000000000000000000000000000000000000a";
const TOKEN_B = "0x000000000000000000000000000000000000000b";

const mockUtil = vi.fn().mockResolvedValue(500_000_000_000_000_000n);

let mockVaultMap: Map<any, any> | null = null;

vi.mock("@/react/hook", () => ({
    usePoolTokens: () => [[TOKEN_A, TOKEN_B]] as const,
    usePoolTotals: () => ({
        supply: new Map(), borrow: new Map(),
    }),
    useVaultContracts: () => [mockVaultMap] as const,
}));

const mockSetPoolUtil = vi.fn();
let mockPoolUtil: Map<any, any> | null = null;

vi.mock("@/zustand", () => ({
    appStore: () => ({
        pool: 300n,
        pool_util: mockPoolUtil,
        set_pool_util: mockSetPoolUtil,
    }),
}));

import { usePoolUtil } from "./use-pool-util";
import { PoolToken } from "@/type";

function buildVaultMap() {
    const ptA = PoolToken.from(300n, TOKEN_A);
    const ptB = PoolToken.from(300n, TOKEN_B);
    const map = new Map();
    map.set(ptA, { target: "0xVA", util: mockUtil });
    map.set(ptB, { target: "0xVB", util: mockUtil });
    return map;
}

function createWrapper() {
    const client = new QueryClient({
        defaultOptions: {
            queries: { retry: false, gcTime: 0 },
        },
    });
    return function Wrapper({ children }: { children: React.ReactNode }) {
        return React.createElement(
            QueryClientProvider, { client }, children,
        );
    };
}

describe("usePoolUtil", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockPoolUtil = new Map();
        mockVaultMap = buildVaultMap();
        mockUtil.mockResolvedValue(500_000_000_000_000_000n);
    });

    it("should return [pool_util, set_pool_util]", () => {
        const { result } = renderHook(
            () => usePoolUtil(),
            { wrapper: createWrapper() },
        );
        expect(result.current[0]).toBeInstanceOf(Map);
        expect(typeof result.current[1]).toBe("function");
    });

    it("should fetch util from vault contracts", async () => {
        renderHook(
            () => usePoolUtil(),
            { wrapper: createWrapper() },
        );
        await waitFor(() => {
            expect(mockUtil).toHaveBeenCalledTimes(2);
        });
    });

    it("should update store with util map", async () => {
        renderHook(
            () => usePoolUtil(),
            { wrapper: createWrapper() },
        );
        await waitFor(() => {
            expect(mockSetPoolUtil).toHaveBeenCalled();
        });
        const map = mockSetPoolUtil.mock.calls[0]![0];
        expect(map).toBeInstanceOf(Map);
        expect(map.size).toBe(2);
    });

    it("should not fetch when vault map is null", () => {
        mockVaultMap = null;
        renderHook(
            () => usePoolUtil(),
            { wrapper: createWrapper() },
        );
        expect(mockUtil).not.toHaveBeenCalled();
    });

    it("should handle Array-type pool_util (deserialized)", () => {
        (mockPoolUtil as any) = [];
        const { result } = renderHook(
            () => usePoolUtil(),
            { wrapper: createWrapper() },
        );
        expect(result.current[0]).toBeInstanceOf(Map);
    });
});
