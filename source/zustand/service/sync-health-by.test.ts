import { describe, expect, it, vi, beforeEach } from "vitest";
import { stubGlobals, mockRunner } from "@/test";

stubGlobals();

const mocks = vi.hoisted(() => ({
    onTransfer: vi.fn().mockResolvedValue(undefined),
    offTransfer: vi.fn(),
    healthOf: vi.fn().mockResolvedValue([100n, 200n]),
    supplyOf: vi.fn().mockResolvedValue("0xsupply_position"),
    borrowOf: vi.fn().mockResolvedValue("0xborrow_position"),
}));

vi.mock("@/contract", () => ({
    PoolContract: vi.fn().mockImplementation(function () {
        return {
            healthOf: mocks.healthOf,
            supplyOf: mocks.supplyOf,
            borrowOf: mocks.borrowOf,
        };
    }),
    PositionContract: vi.fn().mockImplementation(function () {
        return {
            onTransfer: mocks.onTransfer,
            offTransfer: mocks.offTransfer,
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
import { syncHealthBy } from "./sync-health-by";
import { Health, PoolAccount } from "@/type";
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
    set_portfolio_health: (m: Map<PoolAccount, Health>) => void;
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
        portfolio_health: null,
        set_portfolio_health: (m) => set({ portfolio_health: m }, "portfolio_health"),
        set_error: () => {},
        ...overrides,
    }))) as unknown as Store<AppState>;
}

describe("syncHealthBy", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should return the store", () => {
        const store = createTestStore();
        const result = syncHealthBy(store, {
            runner: mockRunner,
            position_of: "supplyOf",
        });
        expect(result).toBe(store);
    });

    it("should attach listeners with supplyOf", async () => {
        const pool = 300n;
        const account = 1n;
        const tokenAddr = addressOf(100n);
        const store = createTestStore({
            pool_tokens: new Map([[pool, [tokenAddr]]]),
        });
        syncHealthBy(store, {
            runner: mockRunner,
            position_of: "supplyOf",
        });

        store.setState({ pool, wallet_account: account });
        await new Promise((r) => setTimeout(r, 50));

        expect(mocks.supplyOf).toHaveBeenCalledWith(tokenAddr);
        expect(mocks.onTransfer).toHaveBeenCalled();
    });

    it("should attach listeners with borrowOf", async () => {
        const pool = 300n;
        const account = 1n;
        const tokenAddr = addressOf(100n);
        const store = createTestStore({
            pool_tokens: new Map([[pool, [tokenAddr]]]),
        });
        syncHealthBy(store, {
            runner: mockRunner,
            position_of: "borrowOf",
        });

        store.setState({ pool, wallet_account: account });
        await new Promise((r) => setTimeout(r, 50));

        expect(mocks.borrowOf).toHaveBeenCalledWith(tokenAddr);
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
        syncHealthBy(store, {
            runner: mockRunner,
            position_of: "supplyOf",
        });

        store.setState({ pool: pool1, wallet_account: account });
        await new Promise((r) => setTimeout(r, 50));

        store.setState({ pool: pool2 });
        await new Promise((r) => setTimeout(r, 50));

        expect(mocks.offTransfer).toHaveBeenCalled();
    });

    it("should not attach when pool is 0", async () => {
        const store = createTestStore();
        syncHealthBy(store, {
            runner: mockRunner,
            position_of: "supplyOf",
        });

        store.setState({ pool: 0n, wallet_account: 1n });
        await new Promise((r) => setTimeout(r, 50));

        expect(mocks.onTransfer).not.toHaveBeenCalled();
    });

    it("should not attach when wallet_account is null", async () => {
        const store = createTestStore({
            pool_tokens: new Map([[300n, [addressOf(100n)]]]),
        });
        syncHealthBy(store, {
            runner: mockRunner,
            position_of: "supplyOf",
        });

        store.setState({ pool: 300n, wallet_account: null });
        await new Promise((r) => setTimeout(r, 50));

        expect(mocks.onTransfer).not.toHaveBeenCalled();
    });

    it("should update portfolio_health on relevant Transfer event", async () => {
        const pool = 300n;
        const account = 1n;
        const tokenAddr = addressOf(100n);
        const pa = PoolAccount.from(pool, account);
        const store = createTestStore({
            pool_tokens: new Map([[pool, [tokenAddr]]]),
            portfolio_health: new Map([[pa, { borrow: 50n, supply: 100n }]]),
        });
        syncHealthBy(store, {
            runner: mockRunner,
            position_of: "supplyOf",
        });

        store.setState({ pool, wallet_account: account });
        await new Promise((r) => setTimeout(r, 50));

        const listener = mocks.onTransfer.mock.calls[0]![0];
        // healthOf returns different values
        mocks.healthOf.mockResolvedValue([200n, 400n]);
        await listener(addressOf(account), addressOf(0n), 100n);
        await new Promise((r) => setTimeout(r, 50));

        const health = store.getState().portfolio_health;
        expect(health).not.toBeNull();
        const h = health!.get(pa);
        expect(h).toEqual({ borrow: 200n, supply: 400n });
    });

    it("should skip update when Health.eq returns true", async () => {
        const pool = 300n;
        const account = 1n;
        const tokenAddr = addressOf(100n);
        const pa = PoolAccount.from(pool, account);
        const store = createTestStore({
            pool_tokens: new Map([[pool, [tokenAddr]]]),
            portfolio_health: new Map([[pa, { borrow: 100n, supply: 200n }]]),
        });
        const spy = vi.fn();
        store.getState().set_portfolio_health = spy;
        syncHealthBy(store, {
            runner: mockRunner,
            position_of: "supplyOf",
        });

        store.setState({ pool, wallet_account: account });
        await new Promise((r) => setTimeout(r, 50));

        const listener = mocks.onTransfer.mock.calls[0]![0];
        // healthOf returns same values
        mocks.healthOf.mockResolvedValue([100n, 200n]);
        await listener(addressOf(account), addressOf(0n), 100n);
        await new Promise((r) => setTimeout(r, 50));

        expect(spy).not.toHaveBeenCalled();
    });

    it("should skip irrelevant Transfer events", async () => {
        const pool = 300n;
        const account = 1n;
        const tokenAddr = addressOf(100n);
        const store = createTestStore({
            pool_tokens: new Map([[pool, [tokenAddr]]]),
        });
        syncHealthBy(store, {
            runner: mockRunner,
            position_of: "supplyOf",
        });

        store.setState({ pool, wallet_account: account });
        await new Promise((r) => setTimeout(r, 50));

        const listener = mocks.onTransfer.mock.calls[0]![0];
        await listener(addressOf(99n), addressOf(98n), 100n);
        await new Promise((r) => setTimeout(r, 50));

        expect(mocks.healthOf).not.toHaveBeenCalled();
    });
});
