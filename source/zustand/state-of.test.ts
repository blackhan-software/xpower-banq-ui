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

import { PoolToken } from "@/type/pool-token";
import { PoolAccount } from "@/type/pool-account";
import { Nullable, Symbol } from "@/type";
import { stateOf } from "./state-of";

type AppState = Parameters<typeof stateOf>[0];

function makePoolToken() {
    const token = {
        address: `0x${(100n).toString(16).padStart(40, "0")}`,
        decimals: 18n, supply: 0n, symbol: Symbol.APOW,
    };
    return PoolToken.from(300n, token);
}

function makePoolAccount() {
    return PoolAccount.from(300n, 1n);
}

describe("stateOf", () => {
    it("should restore PoolToken-keyed Maps from JSON round-trip", () => {
        const pt = makePoolToken();
        const state = {
            oracle_quote: new Map([[pt, { bid: 1n, ask: 2n, mid: 1n }]]),
            pool_rate_model: new Map([[pt, "rm"]]),
            pool_lock_params: new Map([[pt, "lp"]]),
            pool_rate_info: new Map([[pt, "ri"]]),
            pool_util_page: new Map([[pt, []]]),
            pool_util_curr: new Map([[pt, "uc"]]),
            pool_util: new Map([[pt, "u"]]),
            pool_supply: new Map([[pt, 100n]]),
            pool_borrow: new Map([[pt, 50n]]),
            pool_tokens: new Map([[300n, ["0x1"]]]),
            portfolio_amount: null,
            portfolio_limits: null,
            portfolio_supply: null,
            portfolio_borrow: null,
            portfolio_health: null,
            portfolio_yields: null,
        } as unknown as Nullable<AppState>;

        // Simulate JSON round-trip (serializes Maps to arrays)
        const serialized = JSON.parse(JSON.stringify(state));
        stateOf(serialized as Nullable<AppState>);

        expect(serialized.oracle_quote).toBeInstanceOf(Map);
        expect(serialized.pool_rate_model).toBeInstanceOf(Map);
        expect(serialized.pool_lock_params).toBeInstanceOf(Map);
        expect(serialized.pool_rate_info).toBeInstanceOf(Map);
        expect(serialized.pool_util_page).toBeInstanceOf(Map);
        expect(serialized.pool_util_curr).toBeInstanceOf(Map);
        expect(serialized.pool_util).toBeInstanceOf(Map);
        expect(serialized.pool_supply).toBeInstanceOf(Map);
        expect(serialized.pool_borrow).toBeInstanceOf(Map);
        expect(serialized.pool_tokens).toBeInstanceOf(Map);
    });

    it("should restore PoolAccount-keyed Maps from JSON round-trip", () => {
        const pa = makePoolAccount();
        const state = {
            oracle_quote: null,
            pool_rate_model: null,
            pool_lock_params: null,
            pool_rate_info: null,
            pool_util_page: null,
            pool_util_curr: null,
            pool_util: null,
            pool_supply: null,
            pool_borrow: null,
            pool_tokens: new Map(),
            portfolio_amount: new Map([[pa, []]]),
            portfolio_limits: new Map([[pa, []]]),
            portfolio_supply: new Map([[pa, []]]),
            portfolio_borrow: new Map([[pa, []]]),
            portfolio_health: new Map([[pa, { borrow: 0n, supply: 0n }]]),
            portfolio_yields: new Map([[pa, 0]]),
        } as unknown as Nullable<AppState>;

        const serialized = JSON.parse(JSON.stringify(state));
        stateOf(serialized as Nullable<AppState>);

        expect(serialized.portfolio_amount).toBeInstanceOf(Map);
        expect(serialized.portfolio_limits).toBeInstanceOf(Map);
        expect(serialized.portfolio_supply).toBeInstanceOf(Map);
        expect(serialized.portfolio_borrow).toBeInstanceOf(Map);
        expect(serialized.portfolio_health).toBeInstanceOf(Map);
        expect(serialized.portfolio_yields).toBeInstanceOf(Map);
    });

    it("should handle null fields gracefully", () => {
        const state = {
            oracle_quote: null,
            pool_rate_model: null,
            pool_lock_params: null,
            pool_rate_info: null,
            pool_util_page: null,
            pool_util_curr: null,
            pool_util: null,
            pool_supply: null,
            pool_borrow: null,
            pool_tokens: new Map(),
            portfolio_amount: null,
            portfolio_limits: null,
            portfolio_supply: null,
            portfolio_borrow: null,
            portfolio_health: null,
            portfolio_yields: null,
        } as unknown as Nullable<AppState>;

        const serialized = JSON.parse(JSON.stringify(state));
        stateOf(serialized as Nullable<AppState>);

        expect(serialized.oracle_quote).toBeNull();
        expect(serialized.portfolio_amount).toBeNull();
        expect(serialized.pool_tokens).toBeInstanceOf(Map);
    });
});
