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

type TestState = ActionsSlice & { value: number };

function makeStore() {
    const creator: SwapCreator<TestState> = (...a) => ({
        ...(createActionsSlice as any)(...a),
        value: 0,
    });
    return create(withSwap(creator));
}

describe("ActionsSlice", () => {
    it("should initialize with empty actions array", () => {
        const store = makeStore();
        expect(store.getState().actions).toEqual([]);
    });
    it("should reset a specific action", () => {
        const store = makeStore();
        // Manually set actions to simulate sync service writes
        store.setState({ actions: ["portfolio_amount", "portfolio_supply"] });
        store.getState().reset_actions("portfolio_amount");
        expect(store.getState().actions).toEqual(["portfolio_supply"]);
    });
    it("should not affect other actions when resetting one", () => {
        const store = makeStore();
        store.setState({ actions: ["teller_mode", "wallet_account"] });
        store.getState().reset_actions("teller_mode");
        expect(store.getState().actions).toEqual(["wallet_account"]);
    });
    it("should handle resetting an action not in the array", () => {
        const store = makeStore();
        store.setState({ actions: ["teller_mode"] });
        store.getState().reset_actions("wallet_account");
        expect(store.getState().actions).toEqual(["teller_mode"]);
    });
});
