import { describe, expect, it, vi, beforeEach } from "vitest";
import { stubGlobals, mockRunner } from "@/test";

stubGlobals();

const mocks = vi.hoisted(() => ({
    onTransfer: vi.fn().mockResolvedValue(undefined),
    offTransfer: vi.fn(),
    balanceOf: vi.fn().mockResolvedValue(500n),
}));

vi.mock("@/contract", () => ({
    ERC20Contract: vi.fn().mockImplementation(function () {
        return {
            onTransfer: mocks.onTransfer,
            offTransfer: mocks.offTransfer,
            balanceOf: mocks.balanceOf,
        };
    }),
}));

vi.mock("@/constant", async () =>
    (await import("@/test/constants")).MOCK_CONSTANTS
);
vi.mock("@/function", async (importOriginal) =>
    (await import("@/test")).mockFunction(importOriginal)
);

import { create } from "zustand";
import { withSwap } from "../middleware/with-swap";
import { syncPortfolioAmount } from "./sync-amount";
import { PoolAccount, Position } from "@/type";
import { addressOf } from "@/function";
import type { AppState } from "../app-store";
import type { Store } from "../zustand-type";

type TestState = {
    actions: string[];
    reset_actions: (a: string) => void;
    pool: bigint;
    pool_tokens: Map<bigint, string[]> | null;
    wallet_account: bigint | null;
    portfolio_amount: Map<PoolAccount, Position[]> | null;
    set_portfolio_amount: (m: Map<PoolAccount, Position[]>) => void;
    set_error: (name: string, error: Error | null) => void;
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
        portfolio_amount: null,
        set_portfolio_amount: (m) => set({ portfolio_amount: m }, "portfolio_amount"),
        set_error: () => {},
        ...overrides,
    }))) as unknown as Store<AppState>;
}

describe("syncPortfolioAmount", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should return the store", () => {
        const store = createTestStore();
        const result = syncPortfolioAmount(store, { runner: mockRunner });
        expect(result).toBe(store);
    });

    it("should attach ERC20 Transfer listeners when wallet and pool are set", async () => {
        const pool = 300n;
        const account = 1n;
        const tokenAddr = addressOf(100n);
        const store = createTestStore({
            pool_tokens: new Map([[pool, [tokenAddr]]]),
        });
        syncPortfolioAmount(store, { runner: mockRunner });

        store.setState({
            pool,
            wallet_account: account,
        });

        // Wait for async listener attachment
        await new Promise((r) => setTimeout(r, 50));
        expect(mocks.onTransfer).toHaveBeenCalled();
    });

    it("should detach listeners when pool changes", async () => {
        const pool1 = 300n;
        const pool2 = 301n;
        const account = 1n;
        const tokenAddr = addressOf(100n);
        const store = createTestStore({
            pool_tokens: new Map([
                [pool1, [tokenAddr]],
                [pool2, [tokenAddr]],
            ]),
        });
        syncPortfolioAmount(store, { runner: mockRunner });

        // Attach first
        store.setState({ pool: pool1, wallet_account: account });
        await new Promise((r) => setTimeout(r, 50));

        // Change pool
        store.setState({ pool: pool2 });
        await new Promise((r) => setTimeout(r, 50));

        expect(mocks.offTransfer).toHaveBeenCalled();
    });

    it("should not attach listeners when pool is 0", async () => {
        const store = createTestStore();
        syncPortfolioAmount(store, { runner: mockRunner });

        store.setState({ pool: 0n, wallet_account: 1n });
        await new Promise((r) => setTimeout(r, 50));

        expect(mocks.onTransfer).not.toHaveBeenCalled();
    });

    it("should not attach listeners when wallet_account is null", async () => {
        const store = createTestStore({
            pool_tokens: new Map([[300n, [addressOf(100n)]]]),
        });
        syncPortfolioAmount(store, { runner: mockRunner });

        store.setState({ pool: 300n, wallet_account: null });
        await new Promise((r) => setTimeout(r, 50));

        expect(mocks.onTransfer).not.toHaveBeenCalled();
    });

    it("should update portfolio_amount on relevant Transfer event", async () => {
        const pool = 300n;
        const account = 1n;
        const tokenAddr = addressOf(100n);
        const pa = PoolAccount.from(pool, account);
        const existingPosition = Position.from(tokenAddr);
        const store = createTestStore({
            pool_tokens: new Map([[pool, [tokenAddr]]]),
            portfolio_amount: new Map([[pa, [existingPosition]]]),
        });
        syncPortfolioAmount(store, { runner: mockRunner });

        store.setState({ pool, wallet_account: account });
        await new Promise((r) => setTimeout(r, 50));

        // Get the listener passed to onTransfer and invoke it
        const listener = mocks.onTransfer.mock.calls[0]![0];
        mocks.balanceOf.mockResolvedValue(999n);
        await listener(addressOf(account), addressOf(0n), 100n);
        await new Promise((r) => setTimeout(r, 50));

        const amounts = store.getState().portfolio_amount;
        expect(amounts).not.toBeNull();
        const positions = amounts!.get(pa);
        expect(positions).toBeDefined();
        expect(positions![0]!.amount).toBe(999n);
    });

    it("should skip update on irrelevant Transfer event", async () => {
        const pool = 300n;
        const account = 1n;
        const tokenAddr = addressOf(100n);
        const pa = PoolAccount.from(pool, account);
        const existingPosition = Position.from(tokenAddr);
        const store = createTestStore({
            pool_tokens: new Map([[pool, [tokenAddr]]]),
            portfolio_amount: new Map([[pa, [existingPosition]]]),
        });
        syncPortfolioAmount(store, { runner: mockRunner });

        store.setState({ pool, wallet_account: account });
        await new Promise((r) => setTimeout(r, 50));

        const listener = mocks.onTransfer.mock.calls[0]![0];
        // Transfer between two irrelevant addresses
        await listener(addressOf(99n), addressOf(98n), 100n);
        await new Promise((r) => setTimeout(r, 50));

        // balanceOf should not have been called
        expect(mocks.balanceOf).not.toHaveBeenCalled();
    });

    it("should skip set when Position.eq returns true", async () => {
        const pool = 300n;
        const account = 1n;
        const tokenAddr = addressOf(100n);
        const pa = PoolAccount.from(pool, account);
        const existingPosition = { ...Position.from(tokenAddr), amount: 500n };
        const store = createTestStore({
            pool_tokens: new Map([[pool, [tokenAddr]]]),
            portfolio_amount: new Map([[pa, [existingPosition]]]),
        });
        const spy = vi.fn();
        store.getState().set_portfolio_amount = spy;
        syncPortfolioAmount(store, { runner: mockRunner });

        store.setState({ pool, wallet_account: account });
        await new Promise((r) => setTimeout(r, 50));

        const listener = mocks.onTransfer.mock.calls[0]![0];
        // balanceOf returns same value (500n)
        mocks.balanceOf.mockResolvedValue(500n);
        await listener(addressOf(account), addressOf(0n), 100n);
        await new Promise((r) => setTimeout(r, 50));

        // set_portfolio_amount should NOT be called because Position.eq is true
        expect(spy).not.toHaveBeenCalled();
    });
});
