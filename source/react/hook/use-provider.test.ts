// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { stubGlobals } from "@/test";

stubGlobals();

const mockProvider = { getBlockNumber: async () => 123 };
const mockProviderFn = vi.fn().mockReturnValue(mockProvider);

vi.mock("@/blockchain", () => ({
    Provider: (...args: unknown[]) => mockProviderFn(...args),
}));
vi.mock("@/constant", async () => ({
    ...(await import("@/test/constants")).MOCK_CONSTANTS,
    PROVIDER_URL: "https://rpc.example.com",
}));
vi.mock("@/function", async (importOriginal) =>
    (await import("@/test")).mockFunction(importOriginal)
);

import { useRemoteProvider, useWalletProvider, useProvider } from "./use-provider";

describe("useProvider", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockProviderFn.mockReturnValue(mockProvider);
    });

    it("should return [null] initially when Provider returns null", () => {
        mockProviderFn.mockReturnValue(null);
        const { result } = renderHook(() => useProvider());
        expect(result.current[0]).toBeNull();
    });

    it("should return the provider when Provider returns a value", () => {
        const { result } = renderHook(() => useProvider({ url: "https://rpc.test" }));
        expect(result.current[0]).toBe(mockProvider);
    });

    it("should reset provider on unmount", () => {
        const { result, unmount } = renderHook(() => useProvider({ url: "https://rpc.test" }));
        expect(result.current[0]).toBe(mockProvider);
        unmount();
    });

    it("should expose set_provider as second element", () => {
        const { result } = renderHook(() => useProvider());
        expect(typeof result.current[1]).toBe("function");
    });
});

describe("useRemoteProvider", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockProviderFn.mockReturnValue(mockProvider);
    });

    it("should pass default PROVIDER_URL", () => {
        renderHook(() => useRemoteProvider());
        expect(mockProviderFn).toHaveBeenCalledWith(
            expect.objectContaining({ url: "https://rpc.example.com" }),
        );
    });

    it("should allow overriding url", () => {
        renderHook(() => useRemoteProvider({ url: "https://custom.rpc" }));
        expect(mockProviderFn).toHaveBeenCalledWith(
            expect.objectContaining({ url: "https://custom.rpc" }),
        );
    });
});

describe("useWalletProvider", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockProviderFn.mockReturnValue(mockProvider);
    });

    it("should call Provider without url", () => {
        renderHook(() => useWalletProvider());
        expect(mockProviderFn).toHaveBeenCalled();
    });
});
