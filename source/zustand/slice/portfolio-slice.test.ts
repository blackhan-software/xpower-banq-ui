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
import { createPortfolioSlice, PortfolioSlice } from "./portfolio-slice";

type TestState = ActionsSlice & PortfolioSlice;

function makeStore() {
    const creator: SwapCreator<TestState> = (...a) => ({
        ...(createActionsSlice as any)(...a),
        ...(createPortfolioSlice as any)(...a),
    });
    return create(withSwap(creator));
}

describe("PortfolioSlice", () => {
    it("should initialize all fields as null", () => {
        const store = makeStore();
        const s = store.getState();
        expect(s.portfolio_amount).toBeNull();
        expect(s.portfolio_limits).toBeNull();
        expect(s.portfolio_supply).toBeNull();
        expect(s.portfolio_borrow).toBeNull();
        expect(s.portfolio_health).toBeNull();
        expect(s.portfolio_yields).toBeNull();
    });
    it("should set portfolio_amount and track in actions", () => {
        const store = makeStore();
        const map = new Map();
        store.getState().set_portfolio_amount(map);
        expect(store.getState().portfolio_amount).toBe(map);
        expect(store.getState().actions).toContain("portfolio_amount");
    });
    it("should set portfolio_supply and track in actions", () => {
        const store = makeStore();
        const map = new Map();
        store.getState().set_portfolio_supply(map);
        expect(store.getState().portfolio_supply).toBe(map);
        expect(store.getState().actions).toContain("portfolio_supply");
    });
    it("should set portfolio_borrow and track in actions", () => {
        const store = makeStore();
        const map = new Map();
        store.getState().set_portfolio_borrow(map);
        expect(store.getState().portfolio_borrow).toBe(map);
        expect(store.getState().actions).toContain("portfolio_borrow");
    });
    it("should set portfolio_health and track in actions", () => {
        const store = makeStore();
        const map = new Map();
        store.getState().set_portfolio_health(map);
        expect(store.getState().portfolio_health).toBe(map);
        expect(store.getState().actions).toContain("portfolio_health");
    });
    it("should set portfolio_yields and track in actions", () => {
        const store = makeStore();
        const map = new Map();
        store.getState().set_portfolio_yields(map);
        expect(store.getState().portfolio_yields).toBe(map);
        expect(store.getState().actions).toContain("portfolio_yields");
    });
    it("should not duplicate last action on repeated set", () => {
        const store = makeStore();
        store.getState().set_portfolio_amount(new Map());
        store.getState().set_portfolio_amount(new Map());
        const actions = store.getState().actions;
        // add() only appends if element !== last
        const count = actions.filter(
            (a: string) => a === "portfolio_amount"
        ).length;
        expect(count).toBe(1);
    });
});
