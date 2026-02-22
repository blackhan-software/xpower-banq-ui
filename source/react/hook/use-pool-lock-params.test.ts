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

const mockParameterOf = vi.fn()
    .mockImplementation((flag: bigint) =>
        flag === 0x20n
            ? Promise.resolve(500n)  // bonus
            : Promise.resolve(200n), // malus
    );

let mockSupplyMap: Map<any, any> | null = null;
let mockBorrowMap: Map<any, any> | null = null;

vi.mock("@/react/hook", () => ({
    usePoolTokens: () => [[TOKEN_A]] as const,
    usePositionContracts: (mode: string) => {
        if (mode === "supply") return [mockSupplyMap] as const;
        return [mockBorrowMap] as const;
    },
}));

const mockSetPoolLockParams = vi.fn();
let mockPoolLockParams: Map<any, any> | null = null;

vi.mock("@/zustand", () => ({
    appStore: () => ({
        pool: 300n,
        pool_lock_params: mockPoolLockParams,
        set_pool_lock_params: mockSetPoolLockParams,
    }),
}));

import { usePoolLockParams } from "./use-pool-lock-params";
import { PoolToken } from "@/type";

function buildPositionMaps() {
    const ptA = PoolToken.from(300n, TOKEN_A);
    const su = new Map();
    su.set(ptA, { target: "0xSU", parameterOf: mockParameterOf });
    const bo = new Map();
    bo.set(ptA, { target: "0xBO", parameterOf: mockParameterOf });
    return { su, bo };
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

describe("usePoolLockParams", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockPoolLockParams = new Map();
        const { su, bo } = buildPositionMaps();
        mockSupplyMap = su;
        mockBorrowMap = bo;
        mockParameterOf.mockImplementation((flag: bigint) =>
            flag === 0x20n
                ? Promise.resolve(500n)
                : Promise.resolve(200n),
        );
    });

    it("should return [pool_lock_params, set_pool_lock_params]", () => {
        const { result } = renderHook(
            () => usePoolLockParams(),
            { wrapper: createWrapper() },
        );
        expect(result.current[0]).toBeInstanceOf(Map);
        expect(typeof result.current[1]).toBe("function");
    });

    it("should fetch bonus from supply position (0x20n)", async () => {
        renderHook(
            () => usePoolLockParams(),
            { wrapper: createWrapper() },
        );
        await waitFor(() => {
            expect(mockParameterOf).toHaveBeenCalledWith(0x20n);
        });
    });

    it("should fetch malus from borrow position (0x40n)", async () => {
        renderHook(
            () => usePoolLockParams(),
            { wrapper: createWrapper() },
        );
        await waitFor(() => {
            expect(mockParameterOf).toHaveBeenCalledWith(0x40n);
        });
    });

    it("should update store with lock params", async () => {
        renderHook(
            () => usePoolLockParams(),
            { wrapper: createWrapper() },
        );
        await waitFor(() => {
            expect(mockSetPoolLockParams).toHaveBeenCalled();
        });
        const map = mockSetPoolLockParams.mock.calls[0]![0];
        expect(map).toBeInstanceOf(Map);
        const lp = [...map.values()][0];
        expect(lp).toEqual({ bonus: 500, malus: 200 });
    });

    it("should not fetch when supply map is null", () => {
        mockSupplyMap = null;
        renderHook(
            () => usePoolLockParams(),
            { wrapper: createWrapper() },
        );
        expect(mockParameterOf).not.toHaveBeenCalled();
    });

    it("should not fetch when borrow map is null", () => {
        mockBorrowMap = null;
        renderHook(
            () => usePoolLockParams(),
            { wrapper: createWrapper() },
        );
        expect(mockParameterOf).not.toHaveBeenCalled();
    });

    it("should handle Array-type pool_lock_params (deserialized)", () => {
        (mockPoolLockParams as any) = [];
        const { result } = renderHook(
            () => usePoolLockParams(),
            { wrapper: createWrapper() },
        );
        expect(result.current[0]).toBeInstanceOf(Map);
    });
});
