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

const mockGetQuotes = vi.fn().mockResolvedValue([
    1_000_000_000_000_000_000n,
    1_000_000_000_000_000_000n,
]);

vi.mock("@/react/hook", () => ({
    usePoolContract: () => [{
        target: "0x0001",
    }] as const,
    useOracleContract: () => [{
        target: "0x0002",
        getQuotes: mockGetQuotes,
    }] as const,
    usePoolTokens: () => [[TOKEN_A, TOKEN_B]] as const,
}));

const mockSetOracleQuote = vi.fn();
let mockOracleQuote: Map<any, any> | null = null;

vi.mock("@/zustand", () => ({
    appStore: () => ({
        pool: 300n,
        oracle_quote: mockOracleQuote,
        set_oracle_quote: mockSetOracleQuote,
    }),
}));

import { useOracleQuote } from "./use-oracle-quote";

describe("useOracleQuote", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockOracleQuote = new Map();
        mockGetQuotes.mockResolvedValue([
            1_000_000_000_000_000_000n,
            1_000_000_000_000_000_000n,
        ]);
    });

    it("should return [oracle_quote, set_oracle_quote]", () => {
        const { result } = renderHook(
            () => useOracleQuote(),
            { wrapper: createWrapper() },
        );
        expect(result.current[0]).toBeInstanceOf(Map);
        expect(typeof result.current[1]).toBe("function");
    });

    it("should call getQuotes for each token", async () => {
        renderHook(
            () => useOracleQuote(),
            { wrapper: createWrapper() },
        );
        await waitFor(() => {
            // Called once per token (TOKEN_A, TOKEN_B)
            expect(mockGetQuotes).toHaveBeenCalledTimes(2);
        });
    });

    it("should query with first token as target", async () => {
        renderHook(
            () => useOracleQuote(),
            { wrapper: createWrapper() },
        );
        await waitFor(() => {
            expect(mockGetQuotes).toHaveBeenCalledWith(
                expect.any(BigInt), TOKEN_A, TOKEN_A,
            );
            expect(mockGetQuotes).toHaveBeenCalledWith(
                expect.any(BigInt), TOKEN_B, TOKEN_A,
            );
        });
    });

    it("should update store with quotes map", async () => {
        renderHook(
            () => useOracleQuote(),
            { wrapper: createWrapper() },
        );
        await waitFor(() => {
            expect(mockSetOracleQuote).toHaveBeenCalled();
        });
        const map = mockSetOracleQuote.mock.calls[0]![0];
        expect(map).toBeInstanceOf(Map);
        expect(map.size).toBe(2);
    });

    it("should handle Array-type oracle_quote (deserialized)", () => {
        (mockOracleQuote as any) = [];
        const { result } = renderHook(
            () => useOracleQuote(),
            { wrapper: createWrapper() },
        );
        expect(result.current[0]).toBeInstanceOf(Map);
    });
});
