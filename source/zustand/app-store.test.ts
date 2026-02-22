import { describe, expect, it, vi } from "vitest";
import { stubGlobals } from "@/test";
import { polyfill } from "@/function/polyfill/polyfill";

stubGlobals();
polyfill(JSON.parse);

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

import { withMiddleware } from "./middleware";
import type { AppState } from "./app-store";
import {
    createActionsSlice,
    createErrorSlice,
    createOracleSlice,
    createPoolSlice,
    createPortfolioSlice,
    createTellerSlice,
    createWalletSlice,
} from "./slice";

function createStore() {
    return withMiddleware<AppState>((...a) => ({
        ...createActionsSlice(...a),
        ...createErrorSlice(...a),
        ...createOracleSlice(...a),
        ...createPoolSlice(...a),
        ...createPortfolioSlice(...a),
        ...createTellerSlice(...a),
        ...createWalletSlice(...a),
    }));
}

describe("AppStore", () => {
    it("should initialize with all slices", () => {
        const store = createStore();
        const state = store.getState();
        // ActionsSlice
        expect(state.actions).toEqual([]);
        expect(typeof state.reset_actions).toBe("function");
        // ErrorSlice
        expect(state.errors).toBeInstanceOf(Map);
        expect(typeof state.set_error).toBe("function");
        // OracleSlice
        expect(state.oracle_quote).toBeNull();
        expect(typeof state.set_oracle_quote).toBe("function");
        // PoolSlice
        expect(typeof state.set_pool).toBe("function");
        expect(state.pool_tokens).toBeInstanceOf(Map);
        // PortfolioSlice
        expect(state.portfolio_amount).toBeNull();
        expect(state.portfolio_health).toBeNull();
        expect(state.portfolio_limits).toBeNull();
        expect(state.portfolio_supply).toBeNull();
        expect(state.portfolio_borrow).toBeNull();
        expect(state.portfolio_yields).toBeNull();
        // TellerSlice
        expect(typeof state.set_teller_mode).toBe("function");
        expect(typeof state.set_teller_token).toBe("function");
        // WalletSlice
        expect(state.wallet_account).toBeNull();
        expect(typeof state.set_wallet_account).toBe("function");
    });

    it("should allow state updates via setters", () => {
        const store = createStore();
        store.getState().set_wallet_account(42n);
        expect(store.getState().wallet_account).toBe(42n);
    });

    it("should track actions on set", () => {
        const store = createStore();
        store.getState().set_wallet_account(42n);
        expect(store.getState().actions).toContain("wallet_account");
    });

    it("should reset actions", () => {
        const store = createStore();
        store.getState().set_wallet_account(42n);
        expect(store.getState().actions).toContain("wallet_account");
        store.getState().reset_actions("wallet_account");
        expect(store.getState().actions).not.toContain("wallet_account");
    });

    it("should set and clear errors", () => {
        const store = createStore();
        const err = new Error("test");
        store.getState().set_error("key", err);
        expect(store.getState().errors.get("key")).toBe(err);
        store.getState().set_error("key", null);
        expect(store.getState().errors.has("key")).toBe(false);
    });
});
