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
    UNIT: 1e18,
}));
vi.mock("@/function", async (importOriginal) =>
    (await import("@/test")).mockFunction(importOriginal)
);

const TOKEN_A = "0x000000000000000000000000000000000000000a";

let mockModelMap: Map<any, any> | null = null;
let mockUtilMap: Map<any, any> | null = null;

vi.mock("@/react/hook", () => ({
    usePoolTokens: () => [[TOKEN_A]] as const,
    usePoolRateModels: () => [mockModelMap] as const,
    usePoolUtil: () => [mockUtilMap] as const,
}));

const mockSetPoolRateInfo = vi.fn();
let mockPoolRateInfo: Map<any, any> | null = null;

vi.mock("@/zustand", () => ({
    appStore: () => ({
        pool: 300n,
        pool_rate_info: mockPoolRateInfo,
        set_pool_rate_info: mockSetPoolRateInfo,
    }),
}));

import { usePoolRateInfos } from "./use-pool-rate-infos";
import { PoolToken } from "@/type";

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

describe("usePoolRateInfos", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockPoolRateInfo = new Map();
        const ptA = PoolToken.from(300n, TOKEN_A);
        mockModelMap = new Map();
        mockModelMap.set(ptA, {
            rate: 0.9e18, spread: 0.01e18, util: 0.8e18,
        });
        mockUtilMap = new Map();
        mockUtilMap.set(ptA, { value: 0.5e18 });
    });

    it("should return [pool_rate_info, set_pool_rate_info]", () => {
        const { result } = renderHook(
            () => usePoolRateInfos(),
            { wrapper: createWrapper() },
        );
        expect(result.current[0]).toBeInstanceOf(Map);
        expect(typeof result.current[1]).toBe("function");
    });

    it("should compute rate info from model and util", async () => {
        renderHook(
            () => usePoolRateInfos(),
            { wrapper: createWrapper() },
        );
        await waitFor(() => {
            expect(mockSetPoolRateInfo).toHaveBeenCalled();
        });
        const map = mockSetPoolRateInfo.mock.calls[0]![0];
        expect(map).toBeInstanceOf(Map);
        expect(map.size).toBe(1);
        const rateInfo = [...map.values()][0];
        expect(rateInfo).toHaveProperty("util");
        expect(rateInfo).toHaveProperty("sura");
        expect(rateInfo).toHaveProperty("bora");
    });

    it("should not compute when model map is null", () => {
        mockModelMap = null;
        renderHook(
            () => usePoolRateInfos(),
            { wrapper: createWrapper() },
        );
        expect(mockSetPoolRateInfo).not.toHaveBeenCalled();
    });

    it("should not compute when util map is null", () => {
        mockUtilMap = null;
        renderHook(
            () => usePoolRateInfos(),
            { wrapper: createWrapper() },
        );
        expect(mockSetPoolRateInfo).not.toHaveBeenCalled();
    });

    it("should not compute when model map is empty", () => {
        mockModelMap = new Map();
        renderHook(
            () => usePoolRateInfos(),
            { wrapper: createWrapper() },
        );
        expect(mockSetPoolRateInfo).not.toHaveBeenCalled();
    });

    it("should handle Array-type pool_rate_info (deserialized)", () => {
        (mockPoolRateInfo as any) = [];
        const { result } = renderHook(
            () => usePoolRateInfos(),
            { wrapper: createWrapper() },
        );
        expect(result.current[0]).toBeInstanceOf(Map);
    });

    it("should produce borrow rate >= supply rate", async () => {
        renderHook(
            () => usePoolRateInfos(),
            { wrapper: createWrapper() },
        );
        await waitFor(() => {
            expect(mockSetPoolRateInfo).toHaveBeenCalled();
        });
        const map = mockSetPoolRateInfo.mock.calls[0]![0];
        const rateInfo = [...map.values()][0];
        expect(rateInfo.sura).toBeGreaterThanOrEqual(0);
        expect(rateInfo.bora).toBeGreaterThanOrEqual(0);
        expect(rateInfo.bora).toBeGreaterThanOrEqual(rateInfo.sura);
    });
});
