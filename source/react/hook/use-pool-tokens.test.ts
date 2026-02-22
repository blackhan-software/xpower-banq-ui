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

const mockState = vi.hoisted(() => ({
    pool: 300n as bigint,
    pool_tokens: null as Map<bigint, string[]> | null,
}));

vi.mock("@/zustand", () => ({
    appStore: () => mockState,
}));

import { usePoolTokens } from "./use-pool-tokens";

describe("usePoolTokens", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockState.pool = 300n;
        mockState.pool_tokens = new Map([[300n, ["0xA", "0xB"]]]);
    });

    it("should return tokens for current pool", () => {
        const { result } = renderHook(() => usePoolTokens());
        expect(result.current[0]).toEqual(["0xA", "0xB"]);
    });

    it("should return [null] when pool_tokens is null", () => {
        mockState.pool_tokens = null;
        const { result } = renderHook(() => usePoolTokens());
        expect(result.current[0]).toBeNull();
    });

    it("should return [null] when pool not in map", () => {
        mockState.pool = 999n;
        const { result } = renderHook(() => usePoolTokens());
        expect(result.current[0]).toBeNull();
    });

    it("should override pool with pool_address parameter", () => {
        mockState.pool_tokens = new Map([
            [300n, ["0xA"]],
            [301n, ["0xC", "0xD"]],
        ]);
        const { result } = renderHook(() => usePoolTokens("0x012d"));
        // 0x012d = 301 in hex
        expect(result.current[0]).toEqual(["0xC", "0xD"]);
    });

    it("should handle Array-type pool_tokens (deserialized)", () => {
        (mockState as any).pool_tokens = [[300n, ["0xE"]]];
        const { result } = renderHook(() => usePoolTokens());
        expect(result.current[0]).toEqual(["0xE"]);
    });
});
