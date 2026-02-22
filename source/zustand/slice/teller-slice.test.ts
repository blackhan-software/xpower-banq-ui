import { describe, expect, it, vi } from "vitest";
import { stubGlobals } from "@/test";

stubGlobals();

vi.mock("@/constant", async () =>
    (await import("@/test/constants")).MOCK_CONSTANTS
);
vi.mock("@/function", async (importOriginal) =>
    (await import("@/test")).mockFunction(importOriginal)
);
vi.mock("@/url", () => ({
    ROParams: {
        get: (_k: unknown, fb: unknown) => fb,
        has: () => false, withDevtools: false, withLogger: 0,
        withSession: false, withSync: false, rqStaleTime: 2000,
    },
    RWParams: {
        pool: 300n, mode: "supply", portfolio: true,
        token: { address: "0x0", decimals: 0n, supply: 0n, symbol: "NONE" },
    },
}));

import { create } from "zustand";
import { withSwap, SwapCreator } from "../middleware/with-swap";
import { createActionsSlice, ActionsSlice } from "./actions-slice";
import { createTellerSlice, TellerSlice } from "./teller-slice";

type TestState = ActionsSlice & TellerSlice;

function makeStore() {
    const creator: SwapCreator<TestState> = (...a) => ({
        ...(createActionsSlice as any)(...a),
        ...(createTellerSlice as any)(...a),
    });
    return create(withSwap(creator));
}

describe("TellerSlice", () => {
    it("should initialize teller_percent as 0", () => {
        const store = makeStore();
        expect(store.getState().teller_percent).toBe(0);
    });
    it("should initialize teller_amount as null", () => {
        const store = makeStore();
        expect(store.getState().teller_amount).toBeNull();
    });
    it("should set teller_amount and track in actions", () => {
        const store = makeStore();
        store.getState().set_teller_amount(1.5);
        expect(store.getState().teller_amount).toBe(1.5);
        expect(store.getState().actions).toContain("teller_amount");
    });
    it("should set teller_percent and track in actions", () => {
        const store = makeStore();
        store.getState().set_teller_percent(50);
        expect(store.getState().teller_percent).toBe(50);
        expect(store.getState().actions).toContain("teller_percent");
    });
    it("should set teller_mode", () => {
        const store = makeStore();
        store.getState().set_teller_mode("borrow" as import("@/type").Mode);
        expect(store.getState().teller_mode).toBe("borrow");
        expect(store.getState().actions).toContain("teller_mode");
    });
    it("should set teller_flag", () => {
        const store = makeStore();
        store.getState().set_teller_flag(false);
        expect(store.getState().teller_flag).toBe(false);
        expect(store.getState().actions).toContain("teller_flag");
    });
});
