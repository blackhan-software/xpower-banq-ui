import { describe, expect, it, vi, beforeEach } from "vitest";
import { stubGlobals, mockRunner } from "@/test";

stubGlobals();

const mocks = vi.hoisted(() => ({
    onTransfer: vi.fn().mockResolvedValue(undefined),
    offTransfer: vi.fn(),
    posBalanceOf: vi.fn().mockResolvedValue(1000n),
    posLockOf: vi.fn().mockResolvedValue(100n),
    posTotalSupply: vi.fn().mockResolvedValue(5000n),
    supplyOf: vi.fn().mockResolvedValue("0xsupply_position"),
}));

vi.mock("@/contract", () => ({
    PoolContract: vi.fn().mockImplementation(function () {
        return { supplyOf: mocks.supplyOf };
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
import { syncPortfolioSupply } from "./sync-portfolio";
import { PoolAccount, PoolToken, Position } from "@/type";
import { addressOf } from "@/function";
import type { AppState } from "../app-store";
import type { Store } from "../zustand-type";

type TestState = {
    actions: string[];
    reset_actions: (a: string) => void;
    pool: bigint;
    pool_tokens: Map<bigint, string[]> | null;
    pool_supply: Map<PoolToken, bigint>;
    wallet_account: bigint | null;
    portfolio_supply: Map<PoolAccount, Position[]> | null;
    set_portfolio_supply: (m: Map<PoolAccount, Position[]>) => void;
    set_pool_supply: (m: Map<PoolToken, bigint>) => void;
};

function createTestStore(overrides?: Partial<TestState>): Store<AppState> {
    return create(withSwap<TestState>((set, get) => ({
        actions: [],
        reset_actions: (a: string) => {
            set({ actions: get().actions.filter((x: string) => x !== a) }, `reset:${a}`);
        },
        pool: 0n,
        pool_tokens: null,
        pool_supply: new Map(),
        wallet_account: null,
        portfolio_supply: null,
        set_portfolio_supply: (m) => set({ portfolio_supply: m }, "portfolio_supply"),
        set_pool_supply: (m) => set({ pool_supply: m }, "pool_supply"),
        ...overrides,
    }))) as unknown as Store<AppState>;
}

describe("syncPortfolioSupply", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should return the store", () => {
        const store = createTestStore();
        const result = syncPortfolioSupply(store, { runner: mockRunner });
        expect(result).toBe(store);
    });

    it("should create PoolContract and resolve supplyOf per token", async () => {
        const pool = 300n;
        const account = 1n;
        const tokenAddr = addressOf(100n);
        const store = createTestStore({
            pool_tokens: new Map([[pool, [tokenAddr]]]),
        });
        syncPortfolioSupply(store, { runner: mockRunner });

        store.setState({ pool, wallet_account: account });
        await new Promise((r) => setTimeout(r, 50));

        expect(mocks.supplyOf).toHaveBeenCalledWith(tokenAddr);
    });

    it("should attach PositionContract Transfer listeners", async () => {
        const pool = 300n;
        const account = 1n;
        const tokenAddr = addressOf(100n);
        const store = createTestStore({
            pool_tokens: new Map([[pool, [tokenAddr]]]),
        });
        syncPortfolioSupply(store, { runner: mockRunner });

        store.setState({ pool, wallet_account: account });
        await new Promise((r) => setTimeout(r, 50));

        expect(mocks.onTransfer).toHaveBeenCalled();
    });

    it("should detach listeners on pool change", async () => {
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
        syncPortfolioSupply(store, { runner: mockRunner });

        store.setState({ pool: pool1, wallet_account: account });
        await new Promise((r) => setTimeout(r, 50));

        store.setState({ pool: pool2 });
        await new Promise((r) => setTimeout(r, 50));

        expect(mocks.offTransfer).toHaveBeenCalled();
    });

    it("should not attach when pool is 0", async () => {
        const store = createTestStore();
        syncPortfolioSupply(store, { runner: mockRunner });

        store.setState({ pool: 0n, wallet_account: 1n });
        await new Promise((r) => setTimeout(r, 50));

        expect(mocks.onTransfer).not.toHaveBeenCalled();
    });

    it("should not attach when wallet_account is null", async () => {
        const store = createTestStore({
            pool_tokens: new Map([[300n, [addressOf(100n)]]]),
        });
        syncPortfolioSupply(store, { runner: mockRunner });

        store.setState({ pool: 300n, wallet_account: null });
        await new Promise((r) => setTimeout(r, 50));

        expect(mocks.onTransfer).not.toHaveBeenCalled();
    });
});
