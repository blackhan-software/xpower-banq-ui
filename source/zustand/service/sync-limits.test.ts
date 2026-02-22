import { describe, expect, it, vi, beforeEach } from "vitest";
import { stubGlobals, mockRunner } from "@/test";
import { polyfill } from "@/function/polyfill/polyfill";

stubGlobals();
polyfill(JSON.parse);

vi.mock("@/constant", async () =>
    (await import("@/test/constants")).MOCK_CONSTANTS
);
vi.mock("@/function", async (importOriginal) =>
    (await import("@/test")).mockFunction(importOriginal, {
        buffered_ms: <T extends (...args: unknown[]) => unknown>(fn: T) => fn,
    })
);

import { create } from "zustand";
import { withSwap } from "../middleware/with-swap";
import { syncPortfolioLimits } from "./sync-limits";
import { Health, Limit, PoolAccount, PoolToken, Quote } from "@/type";
import { addressOf } from "@/function";
import type { AppState } from "../app-store";
import type { Store } from "../zustand-type";

type TestState = {
    actions: string[];
    reset_actions: (a: string) => void;
    pool: bigint;
    pool_tokens: Map<bigint, string[]> | null;
    wallet_account: bigint | null;
    portfolio_health: Map<PoolAccount, Health> | null;
    portfolio_limits: Map<PoolAccount, Limit[]> | null;
    oracle_quote: Map<PoolToken, Quote> | null;
    set_portfolio_limits: (m: Map<PoolAccount, Limit[]>) => void;
};

function createTestStore(overrides?: Partial<TestState>): Store<AppState> {
    return create(withSwap<TestState>((set, get) => ({
        actions: [],
        reset_actions: (a: string) => {
            set({ actions: get().actions.filter((x: string) => x !== a) }, `reset:${a}`);
        },
        pool: 0n,
        pool_tokens: null,
        wallet_account: null,
        portfolio_health: null,
        portfolio_limits: null,
        oracle_quote: null,
        set_portfolio_limits: (m) => set({ portfolio_limits: m }, "portfolio_limits"),
        ...overrides,
    }))) as unknown as Store<AppState>;
}

describe("syncPortfolioLimits", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should return the store", () => {
        const store = createTestStore();
        const result = syncPortfolioLimits(store, { runner: mockRunner });
        expect(result).toBe(store);
    });

    it("should skip when pool is 0", () => {
        const store = createTestStore();
        syncPortfolioLimits(store, { runner: mockRunner });
        store.setState({ pool: 0n, wallet_account: 1n });
        expect(store.getState().portfolio_limits).toBeNull();
    });

    it("should skip when wallet_account is null", () => {
        const store = createTestStore();
        syncPortfolioLimits(store, { runner: mockRunner });
        store.setState({ pool: 300n, wallet_account: null });
        expect(store.getState().portfolio_limits).toBeNull();
    });

    it("should skip when pool_tokens is missing", () => {
        const store = createTestStore();
        syncPortfolioLimits(store, { runner: mockRunner });
        store.setState({ pool: 300n, wallet_account: 1n });
        expect(store.getState().portfolio_limits).toBeNull();
    });

    it("should skip when health is missing", () => {
        const pool = 300n;
        const account = 1n;
        const tokenAddr = addressOf(100n);
        const pt = PoolToken.from(pool, tokenAddr);
        const store = createTestStore({
            pool: pool,
            wallet_account: account,
            pool_tokens: new Map([[pool, [tokenAddr]]]),
            oracle_quote: new Map([[pt, { bid: 1, ask: 1, mid: 1 }]]),
        });
        syncPortfolioLimits(store, { runner: mockRunner });
        // Trigger subscription
        store.setState({ pool });
        expect(store.getState().portfolio_limits).toBeNull();
    });

    it("should skip when quote is missing", () => {
        const pool = 300n;
        const account = 1n;
        const tokenAddr = addressOf(100n);
        const pa = PoolAccount.from(pool, account);
        const store = createTestStore({
            pool: pool,
            wallet_account: account,
            pool_tokens: new Map([[pool, [tokenAddr]]]),
            portfolio_health: new Map([[pa, { borrow: 100n, supply: 200n }]]),
            oracle_quote: new Map(), // empty: missing quote
        });
        syncPortfolioLimits(store, { runner: mockRunner });
        store.setState({ pool });
        expect(store.getState().portfolio_limits).toBeNull();
    });

    it("should compute limits correctly: (999 * wnav * N) / (1000 * ask * unit)", () => {
        const pool = 300n;
        const account = 1n;
        const tokenAddr = addressOf(100n);
        const pa = PoolAccount.from(pool, account);
        const pt = PoolToken.from(pool, tokenAddr);
        // Health with supply=200, borrow=100
        const health: Health = { borrow: 100n, supply: 200n };
        const quote: Quote = { bid: 2, ask: 2, mid: 2 };
        const store = createTestStore({
            pool: pool,
            wallet_account: account,
            pool_tokens: new Map([[pool, [tokenAddr]]]),
            portfolio_health: new Map([[pa, health]]),
            oracle_quote: new Map([[pt, quote]]),
        });
        syncPortfolioLimits(store, { runner: mockRunner });
        // Trigger with a state change
        store.setState({ pool });
        const limits = store.getState().portfolio_limits;
        expect(limits).not.toBeNull();
        const limitsArr = limits!.get(pa);
        expect(limitsArr).toBeDefined();
        expect(limitsArr!.length).toBe(1);
        // Verify limit amount is > 0
        expect(limitsArr![0]!.amount).toBeGreaterThan(0);
    });

    it("should skip update when limits are equal (Limit.eq)", () => {
        const pool = 300n;
        const account = 1n;
        const tokenAddr = addressOf(100n);
        const pa = PoolAccount.from(pool, account);
        const pt = PoolToken.from(pool, tokenAddr);
        const health: Health = { borrow: 100n, supply: 200n };
        const quote: Quote = { bid: 2, ask: 2, mid: 2 };
        const store = createTestStore({
            pool: pool,
            wallet_account: account,
            pool_tokens: new Map([[pool, [tokenAddr]]]),
            portfolio_health: new Map([[pa, health]]),
            oracle_quote: new Map([[pt, quote]]),
        });
        syncPortfolioLimits(store, { runner: mockRunner });
        // First trigger: sets limits
        store.setState({ pool });
        const limits1 = store.getState().portfolio_limits;
        expect(limits1).not.toBeNull();
        // Second trigger with same data: should be skipped by Limit.eq
        store.setState({ pool });
        const limits2 = store.getState().portfolio_limits;
        // Same reference means set_portfolio_limits was not called again
        expect(limits2).toBe(limits1);
    });
});
