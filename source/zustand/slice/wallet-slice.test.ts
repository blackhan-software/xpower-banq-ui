import { describe, expect, it, vi } from "vitest";
import { stubGlobals } from "@/test";

stubGlobals();

vi.mock("@/constant", async () =>
    (await import("@/test/constants")).MOCK_CONSTANTS
);
vi.mock("@/function", async (importOriginal) =>
    (await import("@/test")).mockFunction(importOriginal)
);

import { create } from "zustand";
import { withSwap, SwapCreator } from "../middleware/with-swap";
import { createActionsSlice, ActionsSlice } from "./actions-slice";
import { createWalletSlice, WalletSlice } from "./wallet-slice";

type TestState = ActionsSlice & WalletSlice;

function makeStore() {
    const creator: SwapCreator<TestState> = (...a) => ({
        ...(createActionsSlice as any)(...a),
        ...(createWalletSlice as any)(...a),
    });
    return create(withSwap(creator));
}

describe("WalletSlice", () => {
    it("should initialize wallet_account as null", () => {
        const store = makeStore();
        expect(store.getState().wallet_account).toBeNull();
    });
    it("should set wallet_account via setter", () => {
        const store = makeStore();
        store.getState().set_wallet_account(42n);
        expect(store.getState().wallet_account).toBe(42n);
    });
    it("should track wallet_account in actions array", () => {
        const store = makeStore();
        store.getState().set_wallet_account(42n);
        expect(store.getState().actions).toContain("wallet_account");
    });
    it("should set wallet_account back to null", () => {
        const store = makeStore();
        store.getState().set_wallet_account(42n);
        store.getState().set_wallet_account(null);
        expect(store.getState().wallet_account).toBeNull();
    });
});
