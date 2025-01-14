import { omit } from "@/function";
import { Account, Address, Amount, Health, Limit, Mode, Nullable, OmitKeys, Percent, Pool, PoolAccount, Position, Quote, Rate, RateInfo, RateModel, Token, Total, Util } from "@/type";
import { PoolToken } from "@/type/pool-token";
import { RWParams } from "@/url";
import { withMiddleware } from "./middleware";
import { withServices } from "./service";
import { add } from "./zustand-util";

export interface AppState extends AllState {
    // Actions:
    reset_actions: (action: OmitKeys<AllState, "set_">) => void;
    actions: Array<OmitKeys<AllState, "set_">>;
}
interface AllState {
    // Oracle:
    set_oracle_quote: (map: Map<PoolToken, Quote> | null) => void;
    oracle_quote: Map<PoolToken, Quote> | null;
    // Pool:
    set_pool_rate_model: (map: Map<PoolToken, RateModel> | null) => void;
    pool_rate_model: Map<PoolToken, RateModel> | null;
    set_pool_rate_info: (map: Map<PoolToken, RateInfo> | null) => void;
    pool_rate_info: Map<PoolToken, RateInfo> | null;
    set_pool_util_page: (util: Map<PoolToken, Util[]> | null) => void;
    pool_util_page: Map<PoolToken, Util[]> | null;
    set_pool_util_curr: (util: Map<PoolToken, Util> | null) => void;
    pool_util_curr: Map<PoolToken, Util> | null;
    set_pool_util: (map: Map<PoolToken, Util> | null) => void;
    pool_util: Map<PoolToken, Util> | null;
    set_pool_supply: (map: Map<PoolToken, Total> | null) => void;
    pool_supply: Map<PoolToken, Total> | null;
    set_pool_borrow: (map: Map<PoolToken, Total> | null) => void;
    pool_borrow: Map<PoolToken, Total> | null;
    set_pool_tokens: (map: Map<Pool, Address[]> | null) => void;
    pool_tokens: Map<Pool, Address[]> | null;
    set_pool: (pool: Pool) => void;
    pool: Pool;
    // Portfolio:
    set_portfolio_amount: (amount: Map<PoolAccount, Position[]> | null) => void;
    portfolio_amount: Map<PoolAccount, Position[]> | null;
    set_portfolio_limits: (apy: Map<PoolAccount, Limit[]> | null) => void;
    portfolio_limits: Map<PoolAccount, Limit[]> | null;
    set_portfolio_supply: (supply: Map<PoolAccount, Position[]> | null) => void;
    portfolio_supply: Map<PoolAccount, Position[]> | null;
    set_portfolio_borrow: (borrow: Map<PoolAccount, Position[]> | null) => void;
    portfolio_borrow: Map<PoolAccount, Position[]> | null;
    set_portfolio_health: (health: Map<PoolAccount, Health> | null) => void;
    portfolio_health: Map<PoolAccount, Health> | null;
    set_portfolio_yields: (apy: Map<PoolAccount, Rate> | null) => void;
    portfolio_yields: Map<PoolAccount, Rate> | null;
    // Teller:
    set_teller_percent: (percent: Percent | null) => void;
    teller_percent: Percent | null;
    set_teller_amount: (amount: Amount | null) => void;
    teller_amount: Amount | null;
    set_teller_token: (token: Token) => void;
    teller_token: Token;
    set_teller_mode: (mode: Mode) => void;
    teller_mode: Mode;
    set_teller_flag: (flag: boolean) => void;
    teller_flag: boolean;
    // Wallet:
    set_wallet_account: (account: Account | null) => void;
    wallet_account: Account | null;
}
const appStore = withMiddleware<AppState>((set) => ({
    //
    // Action Path:
    //
    reset_actions: (action) => set((s) => ({
        actions: s.actions.filter((a) => a !== action),
    }), {
        type: "RESET_ACTIONS", path: []
    }),
    actions: [],
    //
    // Quote:
    //
    set_oracle_quote: (m) => set({ oracle_quote: m }, {
        type: "ORACLE_QUOTE", quote: m
    }),
    oracle_quote: null,
    //
    // Pool:
    //
    set_pool_rate_model: (m) => set({ pool_rate_model: m }, {
        type: "POOL_RATE_MODEL", rate_model: m
    }),
    set_pool_rate_info: (m) => set({ pool_rate_info: m }, {
        type: "POOL_RATE_INFO", rate_info: m
    }),
    set_pool_util_page: (m) => set({ pool_util_page: m }, {
        type: "POOL_UTIL_PAGE", util_page: m
    }),
    set_pool_util_curr: (m) => set({ pool_util_curr: m }, {
        type: "POOL_UTIL_CURR", util_curr: m
    }),
    set_pool_util: (m) => set({ pool_util: m }, {
        type: "POOL_UTIL", util: m
    }),
    set_pool_supply: (m) => set({ pool_supply: m }, {
        type: "POOL_SUPPLY", supply: m
    }),
    set_pool_borrow: (m) => set({ pool_borrow: m }, {
        type: "POOL_BORROW", borrow: m
    }),
    set_pool_tokens: (m) => set({ pool_tokens: m }, {
        type: "POOL_TOKENS", tokens: m
    }),
    set_pool: (p) => {
        set({ pool: p }, { type: "POOL", pool: p });
        RWParams.pool = p;
    },
    pool_rate_model: null,
    pool_rate_info: null,
    pool_util_page: null,
    pool_util_curr: null,
    pool_util: null,
    pool_supply: null,
    pool_borrow: null,
    pool_tokens: new Map(Pool.all_tokens),
    pool: RWParams.pool,
    //
    // Portfolio:
    //
    set_portfolio_amount: (m) => set((s) => ({
        actions: add(s.actions, "portfolio_amount"),
        portfolio_amount: m
    }), {
        type: "PORTFOLIO_AMOUNT", amount: m
    }),
    set_portfolio_limits: (m) => set((s) => ({
        actions: add(s.actions, "portfolio_limits"),
        portfolio_limits: m
    }), {
        type: "PORTFOLIO_LIMITS", limits: m
    }),
    set_portfolio_supply: (m) => set((s) => ({
        actions: add(s.actions, "portfolio_supply"),
        portfolio_supply: m
    }), {
        type: "PORTFOLIO_SUPPLY", supply: m
    }),
    set_portfolio_borrow: (m) => set((s) => ({
        actions: add(s.actions, "portfolio_borrow"),
        portfolio_borrow: m
    }), {
        type: "PORTFOLIO_BORROW", borrow: m
    }),
    set_portfolio_health: (m) => set((s) => ({
        actions: add(s.actions, "portfolio_health"),
        portfolio_health: m
    }), {
        type: "PORTFOLIO_HEALTH", health: m
    }),
    set_portfolio_yields: (m) => set((s) => ({
        actions: add(s.actions, "portfolio_yields"),
        portfolio_yields: m
    }), {
        type: "PORTFOLIO_YIELD", yield: m
    }),
    portfolio_amount: null,
    portfolio_limits: null,
    portfolio_supply: null,
    portfolio_borrow: null,
    portfolio_health: null,
    portfolio_yields: null,
    //
    // Teller:
    //
    set_teller_percent: (p) => set((s) => ({
        actions: add(s.actions, "teller_percent"),
        teller_percent: p,
    }), {
        type: "TELLER_PERCENT", percent: p
    }),
    set_teller_amount: (a) => set((s) => ({
        actions: add(s.actions, "teller_amount"),
        teller_amount: a,
    }), {
        type: "TELLER_AMOUNT", amount: a
    }),
    set_teller_token: (t) => set((s) => ({
        actions: add(s.actions, "teller_token"),
        teller_token: t
    }), {
        type: "TELLER_TOKEN", token: t
    }),
    set_teller_mode: (m) => set((s) => ({
        actions: add(s.actions, "teller_mode"),
        teller_mode: m
    }), {
        type: "TELLER_MODE", mode: m
    }),
    set_teller_flag: (f) => set((s) => ({
        actions: add(s.actions, "teller_flag"),
        teller_flag: f
    }), {
        type: "TELLER_FLAG", flag: f
    }),
    teller_percent: 0,
    teller_amount: null,
    teller_flag: RWParams.portfolio,
    teller_token: RWParams.token,
    teller_mode: RWParams.mode,
    //
    // Wallet:
    //
    set_wallet_account: (a) => set((s) => ({
        actions: add(s.actions, "wallet_account"),
        wallet_account: a,
    }), {
        type: "WALLET_ACCOUNT", account: a
    }),
    wallet_account: null,
}), {
    session: {
        partialize(next) {
            return omit(next, [
                "actions", "teller_amount", "teller_percent",
            ]);
        },
        merge(data, next) {
            const prev = data as Nullable<AppState> | undefined;
            if (prev) {
                // oracle-quote
                prev.oracle_quote = PoolToken.map(prev.oracle_quote);
                // pool-tokens
                prev.pool_rate_model = PoolToken.map(prev.pool_rate_model);
                prev.pool_rate_info = PoolToken.map(prev.pool_rate_info);
                prev.pool_util_page = PoolToken.map(prev.pool_util_page);
                prev.pool_util_curr = PoolToken.map(prev.pool_util_curr);
                prev.pool_util = PoolToken.map(prev.pool_util);
                prev.pool_supply = PoolToken.map(prev.pool_supply);
                prev.pool_borrow = PoolToken.map(prev.pool_borrow);
                prev.pool_tokens = new Map(prev.pool_tokens);
                // pool-account
                prev.portfolio_amount = PoolAccount.map(prev.portfolio_amount);
                prev.portfolio_limits = PoolAccount.map(prev.portfolio_limits);
                prev.portfolio_supply = PoolAccount.map(prev.portfolio_supply);
                prev.portfolio_borrow = PoolAccount.map(prev.portfolio_borrow);
                prev.portfolio_health = PoolAccount.map(prev.portfolio_health);
                prev.portfolio_yields = PoolAccount.map(prev.portfolio_yields);
            }
            return { ...next, ...prev as AppState };
        },
    },
});
export default withServices(appStore);
