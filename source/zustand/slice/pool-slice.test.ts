import { describe, expect, it, vi } from "vitest";
import { stubGlobals } from "@/test";

stubGlobals();

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

import { create } from "zustand";
import { withSwap, SwapCreator } from "../middleware/with-swap";
import { createPoolSlice, PoolSlice } from "./pool-slice";

type TestState = PoolSlice;

function makeStore() {
    const creator: SwapCreator<TestState> = (...a) => ({
        ...(createPoolSlice as any)(...a),
    });
    return create(withSwap(creator));
}

describe("PoolSlice", () => {
    it("should initialize pool from RWParams", () => {
        const store = makeStore();
        expect(typeof store.getState().pool).toBe("bigint");
    });
    it("should initialize pool_tokens as a Map", () => {
        const store = makeStore();
        expect(store.getState().pool_tokens).toBeInstanceOf(Map);
    });
    it("should initialize nullable fields as null", () => {
        const store = makeStore();
        const s = store.getState();
        expect(s.pool_rate_model).toBeNull();
        expect(s.pool_lock_params).toBeNull();
        expect(s.pool_rate_info).toBeNull();
        expect(s.pool_util_page).toBeNull();
        expect(s.pool_util_curr).toBeNull();
        expect(s.pool_util).toBeNull();
        expect(s.pool_supply).toBeNull();
        expect(s.pool_borrow).toBeNull();
    });
    it("should set pool via setter", () => {
        const store = makeStore();
        store.getState().set_pool(999n);
        expect(store.getState().pool).toBe(999n);
    });
    it("should set pool_supply via setter", () => {
        const store = makeStore();
        const map = new Map();
        store.getState().set_pool_supply(map);
        expect(store.getState().pool_supply).toBe(map);
    });
    it("should set pool_borrow via setter", () => {
        const store = makeStore();
        const map = new Map();
        store.getState().set_pool_borrow(map);
        expect(store.getState().pool_borrow).toBe(map);
    });
});
