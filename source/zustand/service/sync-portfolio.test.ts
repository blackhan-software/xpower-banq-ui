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
    borrowOf: vi.fn().mockResolvedValue("0xborrow_position"),
}));

vi.mock("@/contract", () => ({
    PoolContract: vi.fn().mockImplementation(function () {
        return { supplyOf: mocks.supplyOf, borrowOf: mocks.borrowOf };
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
import { syncPortfolioSupply, syncPortfolioBorrow } from "./sync-portfolio";
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
    pool_borrow: Map<PoolToken, bigint>;
    wallet_account: bigint | null;
    portfolio_supply: Map<PoolAccount, Position[]> | null;
    portfolio_borrow: Map<PoolAccount, Position[]> | null;
    set_portfolio_supply: (m: Map<PoolAccount, Position[]>) => void;
    set_portfolio_borrow: (m: Map<PoolAccount, Position[]>) => void;
    set_pool_supply: (m: Map<PoolToken, bigint>) => void;
    set_pool_borrow: (m: Map<PoolToken, bigint>) => void;
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
        pool_supply: new Map(),
        pool_borrow: new Map(),
        wallet_account: null,
        portfolio_supply: null,
        portfolio_borrow: null,
        set_portfolio_supply: (m) => set({ portfolio_supply: m }, "portfolio_supply"),
        set_portfolio_borrow: (m) => set({ portfolio_borrow: m }, "portfolio_borrow"),
        set_pool_supply: (m) => set({ pool_supply: m }, "pool_supply"),
        set_pool_borrow: (m) => set({ pool_borrow: m }, "pool_borrow"),
        set_error: () => {},
        ...overrides,
    }))) as unknown as Store<AppState>;
}

type SyncFn = typeof syncPortfolioSupply;

describe.each<{
    name: string;
    syncFn: SyncFn;
    positionOf: "supplyOf" | "borrowOf";
    portfolioKey: "portfolio_supply" | "portfolio_borrow";
    poolKey: "pool_supply" | "pool_borrow";
}>([
    {
        name: "syncPortfolioSupply",
        syncFn: syncPortfolioSupply,
        positionOf: "supplyOf",
        portfolioKey: "portfolio_supply",
        poolKey: "pool_supply",
    },
    {
        name: "syncPortfolioBorrow",
        syncFn: syncPortfolioBorrow,
        positionOf: "borrowOf",
        portfolioKey: "portfolio_borrow",
        poolKey: "pool_borrow",
    },
])("$name", ({ syncFn, positionOf, portfolioKey, poolKey }) => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should return the store", () => {
        const store = createTestStore();
        const result = syncFn(store, { runner: mockRunner });
        expect(result).toBe(store);
    });

    it("should create PoolContract and resolve positionOf per token", async () => {
        const pool = 300n;
        const account = 1n;
        const tokenAddr = addressOf(100n);
        const store = createTestStore({
            pool_tokens: new Map([[pool, [tokenAddr]]]),
        });
        syncFn(store, { runner: mockRunner });

        store.setState({ pool, wallet_account: account });
        await new Promise((r) => setTimeout(r, 50));

        expect(mocks[positionOf]).toHaveBeenCalledWith(tokenAddr);
    });

    it("should attach PositionContract Transfer listeners", async () => {
        const pool = 300n;
        const account = 1n;
        const tokenAddr = addressOf(100n);
        const store = createTestStore({
            pool_tokens: new Map([[pool, [tokenAddr]]]),
        });
        syncFn(store, { runner: mockRunner });

        store.setState({ pool, wallet_account: account });
        await new Promise((r) => setTimeout(r, 50));

        expect(mocks.onTransfer).toHaveBeenCalled();
    });

    it("should not attach when pool is 0", async () => {
        const store = createTestStore();
        syncFn(store, { runner: mockRunner });

        store.setState({ pool: 0n, wallet_account: 1n });
        await new Promise((r) => setTimeout(r, 50));

        expect(mocks.onTransfer).not.toHaveBeenCalled();
    });

    it("should not attach when wallet_account is null", async () => {
        const store = createTestStore({
            pool_tokens: new Map([[300n, [addressOf(100n)]]]),
        });
        syncFn(store, { runner: mockRunner });

        store.setState({ pool: 300n, wallet_account: null });
        await new Promise((r) => setTimeout(r, 50));

        expect(mocks.onTransfer).not.toHaveBeenCalled();
    });

    it("should update portfolio on relevant Transfer event", async () => {
        const pool = 300n;
        const account = 1n;
        const tokenAddr = addressOf(100n);
        const pa = PoolAccount.from(pool, account);
        const existingPosition = Position.from(tokenAddr);
        const store = createTestStore({
            pool_tokens: new Map([[pool, [tokenAddr]]]),
            [portfolioKey]: new Map([[pa, [existingPosition]]]),
        } as Partial<TestState>);
        syncFn(store, { runner: mockRunner });

        store.setState({ pool, wallet_account: account });
        await new Promise((r) => setTimeout(r, 50));

        const listener = mocks.onTransfer.mock.calls[0]![0];
        mocks.posBalanceOf.mockResolvedValue(777n);
        mocks.posLockOf.mockResolvedValue(50n);
        mocks.posTotalSupply.mockResolvedValue(9999n);
        await listener(addressOf(account), addressOf(0n), 100n);
        await new Promise((r) => setTimeout(r, 50));

        const state = store.getState() as unknown as TestState;
        const portfolio = state[portfolioKey];
        expect(portfolio).not.toBeNull();
        const positions = portfolio!.get(pa);
        expect(positions).toBeDefined();
        expect(positions![0]!.amount).toBe(777n);
    });

    it("should skip irrelevant Transfer events", async () => {
        const pool = 300n;
        const account = 1n;
        const tokenAddr = addressOf(100n);
        const pa = PoolAccount.from(pool, account);
        const existingPosition = Position.from(tokenAddr);
        const store = createTestStore({
            pool_tokens: new Map([[pool, [tokenAddr]]]),
            [portfolioKey]: new Map([[pa, [existingPosition]]]),
        } as Partial<TestState>);
        syncFn(store, { runner: mockRunner });

        store.setState({ pool, wallet_account: account });
        await new Promise((r) => setTimeout(r, 50));

        const listener = mocks.onTransfer.mock.calls[0]![0];
        await listener(addressOf(99n), addressOf(98n), 100n);
        await new Promise((r) => setTimeout(r, 50));

        expect(mocks.posBalanceOf).not.toHaveBeenCalled();
    });

    it("should also update pool total", async () => {
        const pool = 300n;
        const account = 1n;
        const tokenAddr = addressOf(100n);
        const pa = PoolAccount.from(pool, account);
        const pt = PoolToken.from(pool, tokenAddr);
        const existingPosition = Position.from(tokenAddr);
        const store = createTestStore({
            pool_tokens: new Map([[pool, [tokenAddr]]]),
            [portfolioKey]: new Map([[pa, [existingPosition]]]),
        } as Partial<TestState>);
        syncFn(store, { runner: mockRunner });

        store.setState({ pool, wallet_account: account });
        await new Promise((r) => setTimeout(r, 50));

        const listener = mocks.onTransfer.mock.calls[0]![0];
        mocks.posTotalSupply.mockResolvedValue(12345n);
        await listener(addressOf(account), addressOf(0n), 100n);
        await new Promise((r) => setTimeout(r, 50));

        const state = store.getState() as unknown as TestState;
        const poolTotal = state[poolKey]!;
        expect(poolTotal.get(pt)).toBe(12345n);
    });
});

describe("syncPortfolioSupply detach", () => {
    beforeEach(() => { vi.clearAllMocks(); });

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
});

describe("syncPortfolioBorrow detach", () => {
    beforeEach(() => { vi.clearAllMocks(); });

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
});
