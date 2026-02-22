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

const mockModel = vi.fn().mockResolvedValue([
    900_000_000_000_000_000n, // rate
    10_000_000_000_000_000n,  // spread
    800_000_000_000_000_000n, // util
]);

let mockPositionMap: Map<any, any> | null = null;

vi.mock("@/react/hook", () => ({
    usePoolTokens: () => [[TOKEN_A, TOKEN_B]] as const,
    useTellerMode: () => ["supply"] as const,
    usePositionContracts: () => [mockPositionMap] as const,
}));

const mockSetPoolRateModel = vi.fn();
let mockPoolRateModel: Map<any, any> | null = null;

vi.mock("@/zustand", () => ({
    appStore: () => ({
        pool: 300n,
        pool_rate_model: mockPoolRateModel,
        set_pool_rate_model: mockSetPoolRateModel,
    }),
}));

import { usePoolRateModels } from "./use-pool-rate-models";
import { PoolToken } from "@/type";

function buildPositionMap() {
    const ptA = PoolToken.from(300n, TOKEN_A);
    const ptB = PoolToken.from(300n, TOKEN_B);
    const map = new Map();
    map.set(ptA, { target: "0xPA", model: mockModel });
    map.set(ptB, { target: "0xPB", model: mockModel });
    return map;
}

describe("usePoolRateModels", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockPoolRateModel = new Map();
        mockPositionMap = buildPositionMap();
        mockModel.mockResolvedValue([
            900_000_000_000_000_000n,
            10_000_000_000_000_000n,
            800_000_000_000_000_000n,
        ]);
    });

    it("should return [pool_rate_model, set_pool_rate_model]", () => {
        const { result } = renderHook(
            () => usePoolRateModels(),
            { wrapper: createWrapper() },
        );
        expect(result.current[0]).toBeInstanceOf(Map);
        expect(typeof result.current[1]).toBe("function");
    });

    it("should fetch model from position contracts", async () => {
        renderHook(
            () => usePoolRateModels(),
            { wrapper: createWrapper() },
        );
        await waitFor(() => {
            expect(mockModel).toHaveBeenCalledTimes(2);
        });
    });

    it("should update store with rate model map", async () => {
        renderHook(
            () => usePoolRateModels(),
            { wrapper: createWrapper() },
        );
        await waitFor(() => {
            expect(mockSetPoolRateModel).toHaveBeenCalled();
        });
        const map = mockSetPoolRateModel.mock.calls[0]![0];
        expect(map).toBeInstanceOf(Map);
        expect(map.size).toBe(2);
    });

    it("should convert bigint model to RateModel numbers", async () => {
        renderHook(
            () => usePoolRateModels(),
            { wrapper: createWrapper() },
        );
        await waitFor(() => {
            expect(mockSetPoolRateModel).toHaveBeenCalled();
        });
        const map = mockSetPoolRateModel.mock.calls[0]![0];
        const values = [...map.values()];
        expect(values[0]).toEqual({
            rate: Number(900_000_000_000_000_000n),
            spread: Number(10_000_000_000_000_000n),
            util: Number(800_000_000_000_000_000n),
        });
    });

    it("should not fetch when position map is null", () => {
        mockPositionMap = null;
        renderHook(
            () => usePoolRateModels(),
            { wrapper: createWrapper() },
        );
        expect(mockModel).not.toHaveBeenCalled();
    });

    it("should handle Array-type pool_rate_model (deserialized)", () => {
        (mockPoolRateModel as any) = [];
        const { result } = renderHook(
            () => usePoolRateModels(),
            { wrapper: createWrapper() },
        );
        expect(result.current[0]).toBeInstanceOf(Map);
    });
});
