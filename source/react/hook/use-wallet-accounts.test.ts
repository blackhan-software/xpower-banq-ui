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

import { AccountsCtx } from "@/react/context/accounts-ctx";
import { useWalletAccounts } from "./use-wallet-accounts";

describe("useWalletAccounts", () => {
    it("should return context value when provided", () => {
        const accounts = [1n, 2n];
        const connect = vi.fn();
        const wrapper = ({ children }: { children: React.ReactNode }) =>
            React.createElement(
                AccountsCtx.Provider,
                { value: [accounts, connect] as any },
                children,
            );
        const { result } = renderHook(() => useWalletAccounts(), { wrapper });
        expect(result.current[0]).toEqual(accounts);
    });

    it("should throw when context is not provided", () => {
        expect(() => {
            renderHook(() => useWalletAccounts());
        }).toThrow();
    });
});
