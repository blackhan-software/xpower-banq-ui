import { describe, expect, it, vi, beforeEach } from "vitest";
import { stubGlobals, mockRunner } from "@/test";

stubGlobals();

vi.mock("@/constant", async () => ({
    ...(await import("@/test/constants")).MOCK_CONSTANTS,
    UNIT: 1e18,
}));
vi.mock("@/function", async (importOriginal) =>
    (await import("@/test")).mockFunction(importOriginal, {
        buffered_ms: <T extends (...args: unknown[]) => unknown>(fn: T) => fn,
    })
);

import { create } from "zustand";
import { withSwap } from "../middleware/with-swap";
import { syncPortfolioYields } from "./sync-yields";
import { LockParams, PoolAccount, PoolToken, Position, Quote, RateInfo, Symbol } from "@/type";
import { addressOf } from "@/function";
import type { AppState } from "../app-store";
import type { Store } from "../zustand-type";

type TestState = {
    actions: string[];
    reset_actions: (a: string) => void;
    pool: bigint;
    pool_tokens: Map<bigint, string[]> | null;
    pool_rate_info: Map<PoolToken, RateInfo> | null;
    pool_lock_params: Map<PoolToken, LockParams> | null;
    wallet_account: bigint | null;
    portfolio_supply: Map<PoolAccount, Position[]> | null;
    portfolio_borrow: Map<PoolAccount, Position[]> | null;
    portfolio_yields: Map<PoolAccount, number> | null;
    oracle_quote: Map<PoolToken, Quote> | null;
    set_portfolio_yields: (m: Map<PoolAccount, number>) => void;
};

const TOKEN_ADDR = addressOf(100n);

function makePosition(addr: string, amount: bigint, locked = 0n): Position {
    return {
        address: addr,
        decimals: 18n,
        supply: 1000000n,
        symbol: Symbol.APOW,
        amount,
        locked,
        lockedTotal: 0n,
        cap: { supply: [0n, 0n], borrow: [0n, 0n] },
        capTotal: { supply: [0n, 0n], borrow: [0n, 0n] },
    };
}

function createTestStore(overrides?: Partial<TestState>): Store<AppState> {
    return create(withSwap<TestState>((set, get) => ({
        actions: [],
        reset_actions: (a: string) => {
            set({ actions: get().actions.filter((x: string) => x !== a) }, `reset:${a}`);
        },
        pool: 0n,
        pool_tokens: null,
        pool_rate_info: null,
        pool_lock_params: null,
        wallet_account: null,
        portfolio_supply: null,
        portfolio_borrow: null,
        portfolio_yields: null,
        oracle_quote: null,
        set_portfolio_yields: (m) => set({ portfolio_yields: m }, "portfolio_yields"),
        ...overrides,
    }))) as unknown as Store<AppState>;
}

describe("syncPortfolioYields", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should return the store", () => {
        const store = createTestStore();
        const result = syncPortfolioYields(store, { runner: mockRunner });
        expect(result).toBe(store);
    });

    it("should skip when pool is 0", () => {
        const store = createTestStore();
        syncPortfolioYields(store, { runner: mockRunner });
        store.setState({ pool: 0n, wallet_account: 1n });
        expect(store.getState().portfolio_yields).toBeNull();
    });

    it("should skip when wallet_account is null", () => {
        const store = createTestStore();
        syncPortfolioYields(store, { runner: mockRunner });
        store.setState({ pool: 300n, wallet_account: null });
        expect(store.getState().portfolio_yields).toBeNull();
    });

    it("should skip when pool_tokens is missing", () => {
        const store = createTestStore();
        syncPortfolioYields(store, { runner: mockRunner });
        store.setState({ pool: 300n, wallet_account: 1n });
        expect(store.getState().portfolio_yields).toBeNull();
    });

    it("should skip when rate_info or oracle_quote is missing", () => {
        const pool = 300n;
        const account = 1n;
        const store = createTestStore({
            pool,
            wallet_account: account,
            pool_tokens: new Map([[pool, [TOKEN_ADDR]]]),
        });
        syncPortfolioYields(store, { runner: mockRunner });
        store.setState({ pool });
        expect(store.getState().portfolio_yields).toBeNull();
    });

    it("should skip when supply or borrow positions are missing", () => {
        const pool = 300n;
        const account = 1n;
        const pt = PoolToken.from(pool, TOKEN_ADDR);
        const store = createTestStore({
            pool,
            wallet_account: account,
            pool_tokens: new Map([[pool, [TOKEN_ADDR]]]),
            pool_rate_info: new Map([[pt, { sura: 0.05, bora: 0.08, util: { value: 0 } }]]),
            oracle_quote: new Map([[pt, { bid: 1, ask: 1, mid: 1 }]]),
            // No supply or borrow positions
        });
        syncPortfolioYields(store, { runner: mockRunner });
        store.setState({ pool });
        expect(store.getState().portfolio_yields).toBeNull();
    });

    it("should compute yields with known values", () => {
        const pool = 300n;
        const account = 1n;
        const pa = PoolAccount.from(pool, account);
        const pt = PoolToken.from(pool, TOKEN_ADDR);
        const supply_pos = makePosition(TOKEN_ADDR, 1000n * 10n ** 18n);
        const borrow_pos = makePosition(TOKEN_ADDR, 500n * 10n ** 18n);
        const store = createTestStore({
            pool,
            wallet_account: account,
            pool_tokens: new Map([[pool, [TOKEN_ADDR]]]),
            pool_rate_info: new Map([[pt, { sura: 0.05, bora: 0.08, util: { value: 0 } }]]),
            pool_lock_params: null,
            oracle_quote: new Map([[pt, { bid: 1, ask: 1, mid: 1 }]]),
            portfolio_supply: new Map([[pa, [supply_pos]]]),
            portfolio_borrow: new Map([[pa, [borrow_pos]]]),
        });
        syncPortfolioYields(store, { runner: mockRunner });
        // Trigger
        store.setState({ pool });
        const yields = store.getState().portfolio_yields;
        expect(yields).not.toBeNull();
        const y = yields!.get(pa);
        expect(typeof y).toBe("number");
    });

    it("should return 0 yield when positions sum is 0", () => {
        const pool = 300n;
        const account = 1n;
        const pa = PoolAccount.from(pool, account);
        const pt = PoolToken.from(pool, TOKEN_ADDR);
        const zero_pos = makePosition(TOKEN_ADDR, 0n);
        const store = createTestStore({
            pool,
            wallet_account: account,
            pool_tokens: new Map([[pool, [TOKEN_ADDR]]]),
            pool_rate_info: new Map([[pt, { sura: 0.05, bora: 0.08, util: { value: 0 } }]]),
            pool_lock_params: null,
            oracle_quote: new Map([[pt, { bid: 1, ask: 1, mid: 1 }]]),
            portfolio_supply: new Map([[pa, [zero_pos]]]),
            portfolio_borrow: new Map([[pa, [zero_pos]]]),
        });
        syncPortfolioYields(store, { runner: mockRunner });
        store.setState({ pool });
        const yields = store.getState().portfolio_yields;
        expect(yields).not.toBeNull();
        const y = yields!.get(pa);
        expect(y).toBe(0);
    });

    it("should include lock bonus/malus adjustments", () => {
        const pool = 300n;
        const account = 1n;
        const pa = PoolAccount.from(pool, account);
        const pt = PoolToken.from(pool, TOKEN_ADDR);
        // Supply with 50% locked
        const supply_pos = makePosition(TOKEN_ADDR, 1000n * 10n ** 18n, 500n * 10n ** 18n);
        const borrow_pos = makePosition(TOKEN_ADDR, 0n);
        const lock_params: LockParams = { bonus: 1e17, malus: 1e17 }; // 10%
        const store = createTestStore({
            pool,
            wallet_account: account,
            pool_tokens: new Map([[pool, [TOKEN_ADDR]]]),
            pool_rate_info: new Map([[pt, { sura: 0.05, bora: 0.08, util: { value: 0 } }]]),
            pool_lock_params: new Map([[pt, lock_params]]),
            oracle_quote: new Map([[pt, { bid: 1, ask: 1, mid: 1 }]]),
            portfolio_supply: new Map([[pa, [supply_pos]]]),
            portfolio_borrow: new Map([[pa, [borrow_pos]]]),
        });
        syncPortfolioYields(store, { runner: mockRunner });
        store.setState({ pool });
        const yields = store.getState().portfolio_yields;
        expect(yields).not.toBeNull();
        const y = yields!.get(pa);
        expect(typeof y).toBe("number");
        // With bonus, yield should be higher than without
        expect(y).not.toBe(0);
    });

    it("should skip when oracle_quote.size !== pool_rate_info.size", () => {
        const pool = 300n;
        const account = 1n;
        const pt = PoolToken.from(pool, TOKEN_ADDR);
        const pt2 = PoolToken.from(pool, addressOf(101n));
        const store = createTestStore({
            pool,
            wallet_account: account,
            pool_tokens: new Map([[pool, [TOKEN_ADDR]]]),
            pool_rate_info: new Map([
                [pt, { sura: 0.05, bora: 0.08, util: { value: 0 } }],
                [pt2, { sura: 0.03, bora: 0.06, util: { value: 0 } }],
            ]),
            oracle_quote: new Map([[pt, { bid: 1, ask: 1, mid: 1 }]]),
            // size mismatch: rate_info has 2, oracle_quote has 1
        });
        syncPortfolioYields(store, { runner: mockRunner });
        store.setState({ pool });
        expect(store.getState().portfolio_yields).toBeNull();
    });

    it("should skip when yields are equal", () => {
        const pool = 300n;
        const account = 1n;
        const pa = PoolAccount.from(pool, account);
        const pt = PoolToken.from(pool, TOKEN_ADDR);
        const zero_pos = makePosition(TOKEN_ADDR, 0n);
        const store = createTestStore({
            pool,
            wallet_account: account,
            pool_tokens: new Map([[pool, [TOKEN_ADDR]]]),
            pool_rate_info: new Map([[pt, { sura: 0.05, bora: 0.08, util: { value: 0 } }]]),
            pool_lock_params: null,
            oracle_quote: new Map([[pt, { bid: 1, ask: 1, mid: 1 }]]),
            portfolio_supply: new Map([[pa, [zero_pos]]]),
            portfolio_borrow: new Map([[pa, [zero_pos]]]),
        });
        syncPortfolioYields(store, { runner: mockRunner });
        // First trigger
        store.setState({ pool });
        const yields1 = store.getState().portfolio_yields;
        expect(yields1).not.toBeNull();
        // Second trigger with same data
        store.setState({ pool });
        const yields2 = store.getState().portfolio_yields;
        // Same reference means set_portfolio_yields was not called again
        expect(yields2).toBe(yields1);
    });
});
