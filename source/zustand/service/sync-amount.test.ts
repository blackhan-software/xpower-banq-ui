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
});
