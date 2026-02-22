// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import React from "react";
import { stubGlobals } from "@/test";

stubGlobals();

vi.mock("@/constant", async () => ({
    ...(await import("@/test/constants")).MOCK_CONSTANTS,
    GLOBAL: globalThis,
}));
vi.mock("@/function", async (importOriginal) =>
    (await import("@/test")).mockFunction(importOriginal)
);
vi.mock("@/zustand", () => ({
    appStore: () => ({}),
}));

import { WalletStatusCtx } from "@/react/context/wallet-status-ctx";
import { useWalletStatus } from "./use-wallet-status";

describe("useWalletStatus", () => {
    it("should return context value when provided", () => {
        const wrapper = ({ children }: { children: React.ReactNode }) =>
            React.createElement(
                WalletStatusCtx.Provider,
                { value: "Ready" as any },
                children,
            );
        const { result } = renderHook(() => useWalletStatus(), { wrapper });
        expect(result.current).toBe("Ready");
    });

    it("should throw when context is not provided", () => {
        expect(() => {
            renderHook(() => useWalletStatus());
        }).toThrow();
    });
});
