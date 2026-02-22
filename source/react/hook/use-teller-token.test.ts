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

const ADDR_A = "0x000000000000000000000000000000000000000a";
const ADDR_B = "0x000000000000000000000000000000000000000b";
const ADDR_C = "0x000000000000000000000000000000000000000c";
const ADDR_D = "0x000000000000000000000000000000000000000d";

let mockPool = 300n;
const mockSetPool = vi.fn();

vi.mock("@/react/hook", () => ({
    usePool: () => [mockPool, mockSetPool] as const,
}));
vi.mock("@/url", () => ({
    RWParams: { token: null },
}));

const mockSetTellerToken = vi.fn();
let mockTellerToken = {
    address: ADDR_A, decimals: 18n, supply: 0n, symbol: "APOW",
};

const mockPoolTokens = new Map<bigint, string[]>();
mockPoolTokens.set(300n, [ADDR_A, ADDR_B]);
mockPoolTokens.set(301n, [ADDR_C, ADDR_D]);

vi.mock("@/zustand", () => ({
    appStore: () => ({
        teller_token: mockTellerToken,
        set_teller_token: mockSetTellerToken,
    }),
}));
vi.mock("@/type", async () => {
    const actual = await vi.importActual<typeof import("@/type")>("@/type");
    return {
        ...actual,
        Pool: {
            ...actual.Pool,
            tokens: (pool: bigint) => mockPoolTokens.get(pool) ?? null,
            token: (pool: bigint, idx: number) => mockPoolTokens.get(pool)?.[idx] ?? null,
        },
        Token: {
            ...actual.Token,
            from: (address: string) => ({
                address, decimals: 18n, supply: 0n, symbol: "TEST",
            }),
        },
    };
});

import { useTellerToken } from "./use-teller-token";
import { RWParams } from "@/url";

describe("useTellerToken", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockPool = 300n;
        mockTellerToken = {
            address: ADDR_A, decimals: 18n, supply: 0n, symbol: "APOW",
        };
    });

    it("should return [teller_token, set_teller_token]", () => {
        const { result } = renderHook(() => useTellerToken());
        expect(result.current[0]).toBe(mockTellerToken);
        expect(typeof result.current[1]).toBe("function");
    });

    it("should not update when token is valid for current pool", () => {
        // ADDR_A is in pool 300n tokens, so no switch needed
        renderHook(() => useTellerToken());
        expect(mockSetTellerToken).not.toHaveBeenCalled();
    });

    it("should switch token when pool changes to one without current token", () => {
        // Start with pool 300n (has ADDR_A), then switch to 301n (has ADDR_C, ADDR_D)
        const { rerender } = renderHook(() => useTellerToken());
        mockPool = 301n;
        rerender();
        // ADDR_A is at index 0 in pool 300n, so should use index 0 of pool 301n => ADDR_C
        expect(mockSetTellerToken).toHaveBeenCalledWith(
            expect.objectContaining({ address: ADDR_C }),
        );
    });

    it("should maintain relative position when switching pools", () => {
        // Token at index 1 in old pool should map to index 1 in new pool
        mockTellerToken = {
            address: ADDR_B, decimals: 18n, supply: 0n, symbol: "XPOW",
        };
        const { rerender } = renderHook(() => useTellerToken());
        mockPool = 301n;
        rerender();
        // ADDR_B is at index 1 in pool 300n, so should use index 1 of pool 301n => ADDR_D
        expect(mockSetTellerToken).toHaveBeenCalledWith(
            expect.objectContaining({ address: ADDR_D }),
        );
    });

    it("should update RWParams.token when switching", () => {
        const { rerender } = renderHook(() => useTellerToken());
        mockPool = 301n;
        rerender();
        expect(RWParams.token).toEqual(
            expect.objectContaining({ address: ADDR_C }),
        );
    });

    it("should fallback to first token if index exceeds new pool tokens", () => {
        // Pool 300n has [ADDR_A, ADDR_B], pool with single token
        mockPoolTokens.set(302n, [ADDR_C]);
        mockTellerToken = {
            address: ADDR_B, decimals: 18n, supply: 0n, symbol: "XPOW",
        };
        const { rerender } = renderHook(() => useTellerToken());
        mockPool = 302n;
        rerender();
        // ADDR_B is at index 1, but pool 302n only has index 0 => fallback to ADDR_C
        expect(mockSetTellerToken).toHaveBeenCalledWith(
            expect.objectContaining({ address: ADDR_C }),
        );
    });
});
