// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { stubGlobals } from "@/test";

stubGlobals();

vi.mock("@/constant", async () => ({
    ...(await import("@/test/constants")).MOCK_CONSTANTS,
    GLOBAL: globalThis,
}));
vi.mock("@/function", async (importOriginal) =>
    (await import("@/test")).mockFunction(importOriginal)
);

const TOKEN_A = "0x000000000000000000000000000000000000000a";
const MOCK_TOKEN = {
    address: TOKEN_A, decimals: 18n, supply: 0n, symbol: "APOW" as import("@/type").Symbol,
};

const mockVaultUtil = vi.fn().mockResolvedValue(600_000_000_000_000_000n);

let mockVault: any = {
    target: "0xV1",
    util: mockVaultUtil,
};

vi.mock("@/react/hook", () => ({
    useVaultContract: () => [mockVault] as const,
}));

const mockSetPoolUtilCurr = vi.fn();
let mockPoolUtilCurr: Map<any, any> | null = null;

vi.mock("@/zustand", () => ({
    appStore: () => ({
        pool: 300n,
        pool_util_curr: mockPoolUtilCurr,
        set_pool_util_curr: mockSetPoolUtilCurr,
    }),
}));

import { usePoolUtilCurr } from "./use-pool-util-curr";

describe("usePoolUtilCurr", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockPoolUtilCurr = new Map();
        mockVault = {
            target: "0xV1",
            util: mockVaultUtil,
        };
        mockVaultUtil.mockResolvedValue(600_000_000_000_000_000n);
    });

    it("should return [pool_util_curr, set_pool_util_curr]", () => {
        const { result } = renderHook(
            () => usePoolUtilCurr(MOCK_TOKEN),
        );
        expect(result.current[0]).toBeInstanceOf(Map);
        expect(typeof result.current[1]).toBe("function");
    });

    it("should fetch util from vault contract", async () => {
        renderHook(() => usePoolUtilCurr(MOCK_TOKEN));
        await waitFor(() => {
            expect(mockVaultUtil).toHaveBeenCalled();
        });
    });

    it("should update store with util value", async () => {
        renderHook(() => usePoolUtilCurr(MOCK_TOKEN));
        await waitFor(() => {
            expect(mockSetPoolUtilCurr).toHaveBeenCalled();
        });
        const map = mockSetPoolUtilCurr.mock.calls[0]![0];
        expect(map).toBeInstanceOf(Map);
        const util = [...map.values()][0];
        expect(util).toEqual({
            value: Number(600_000_000_000_000_000n),
        });
    });

    it("should not fetch when vault is null", () => {
        mockVault = null;
        renderHook(() => usePoolUtilCurr(MOCK_TOKEN));
        expect(mockVaultUtil).not.toHaveBeenCalled();
    });

    it("should handle Array-type pool_util_curr (deserialized)", () => {
        (mockPoolUtilCurr as any) = [];
        const { result } = renderHook(
            () => usePoolUtilCurr(MOCK_TOKEN),
        );
        expect(result.current[0]).toBeInstanceOf(Map);
    });
});
