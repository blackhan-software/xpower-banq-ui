import { describe, expect, it, vi, beforeEach } from "vitest";
import { stubGlobals, mockRunner } from "@/test";

stubGlobals();

const mocks = vi.hoisted(() => ({
    onTransfer: vi.fn().mockResolvedValue(undefined),
    offTransfer: vi.fn(),
    posBalanceOf: vi.fn().mockResolvedValue(1000n),
    posLockOf: vi.fn().mockResolvedValue(100n),
    posTotalSupply: vi.fn().mockResolvedValue(5000n),
    borrowOf: vi.fn().mockResolvedValue("0xborrow_position"),
}));

vi.mock("@/contract", () => ({
    PoolContract: vi.fn().mockImplementation(function () {
        return { borrowOf: mocks.borrowOf };
    }),
    PositionContract: vi.fn().mockImplementation(function () {
        return {
            onTransfer: mocks.onTransfer,
            offTransfer: mocks.offTransfer,
            balanceOf: mocks.posBalanceOf,
            lockOf: mocks.posLockOf,
            totalSupply: mocks.posTotalSupply,
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
import { syncPortfolioBorrow } from "./sync-portfolio";
import { PoolAccount, PoolToken, Position } from "@/type";
import { addressOf } from "@/function";
import type { AppState } from "../app-store";
import type { Store } from "../zustand-type";

type TestState = {
    actions: string[];
    reset_actions: (a: string) => void;
    pool: bigint;
    pool_tokens: Map<bigint, string[]> | null;
    pool_borrow: Map<PoolToken, bigint>;
    wallet_account: bigint | null;
    portfolio_borrow: Map<PoolAccount, Position[]> | null;
    set_portfolio_borrow: (m: Map<PoolAccount, Position[]>) => void;
    set_pool_borrow: (m: Map<PoolToken, bigint>) => void;
};

function createTestStore(overrides?: Partial<TestState>): Store<AppState> {
    return create(withSwap<TestState>((set, get) => ({
        actions: [],
        reset_actions: (a: string) => {
            set({ actions: get().actions.filter((x: string) => x !== a) }, `reset:${a}`);
        },
        pool: 0n,
        pool_tokens: null,
        pool_borrow: new Map(),
        wallet_account: null,
        portfolio_borrow: null,
        set_portfolio_borrow: (m) => set({ portfolio_borrow: m }, "portfolio_borrow"),
        set_pool_borrow: (m) => set({ pool_borrow: m }, "pool_borrow"),
        ...overrides,
    }))) as unknown as Store<AppState>;
}

describe("syncPortfolioBorrow", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should return the store", () => {
        const store = createTestStore();
        const result = syncPortfolioBorrow(store, { runner: mockRunner });
        expect(result).toBe(store);
    });

    it("should create PoolContract and resolve borrowOf per token", async () => {
        const pool = 300n;
        const account = 1n;
        const tokenAddr = addressOf(100n);
        const store = createTestStore({
            pool_tokens: new Map([[pool, [tokenAddr]]]),
        });
        syncPortfolioBorrow(store, { runner: mockRunner });

        store.setState({ pool, wallet_account: account });
        await new Promise((r) => setTimeout(r, 50));

        expect(mocks.borrowOf).toHaveBeenCalledWith(tokenAddr);
    });

    it("should attach PositionContract Transfer listeners", async () => {
        const pool = 300n;
        const account = 1n;
        const tokenAddr = addressOf(100n);
        const store = createTestStore({
            pool_tokens: new Map([[pool, [tokenAddr]]]),
        });
        syncPortfolioBorrow(store, { runner: mockRunner });

        store.setState({ pool, wallet_account: account });
        await new Promise((r) => setTimeout(r, 50));

        expect(mocks.onTransfer).toHaveBeenCalled();
    });

    it("should detach listeners on account change", async () => {
        const pool = 300n;
        const account1 = 1n;
        const account2 = 2n;
        const tokenAddr = addressOf(100n);
        const store = createTestStore({
            pool_tokens: new Map([[pool, [tokenAddr]]]),
        });
        syncPortfolioBorrow(store, { runner: mockRunner });

        store.setState({ pool, wallet_account: account1 });
        await new Promise((r) => setTimeout(r, 50));

        store.setState({ wallet_account: account2 });
        await new Promise((r) => setTimeout(r, 50));

        expect(mocks.offTransfer).toHaveBeenCalled();
    });

    it("should not attach when pool is 0", async () => {
        const store = createTestStore();
        syncPortfolioBorrow(store, { runner: mockRunner });

        store.setState({ pool: 0n, wallet_account: 1n });
        await new Promise((r) => setTimeout(r, 50));

        expect(mocks.onTransfer).not.toHaveBeenCalled();
    });

    it("should not attach when wallet_account is null", async () => {
        const store = createTestStore({
            pool_tokens: new Map([[300n, [addressOf(100n)]]]),
        });
        syncPortfolioBorrow(store, { runner: mockRunner });

        store.setState({ pool: 300n, wallet_account: null });
        await new Promise((r) => setTimeout(r, 50));

        expect(mocks.onTransfer).not.toHaveBeenCalled();
    });
});
