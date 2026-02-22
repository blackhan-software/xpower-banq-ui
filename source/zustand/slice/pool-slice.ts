import { Address, LockParams, Pool, RateInfo, RateModel, Total, Util } from "@/type";
import { PoolToken } from "@/type/pool-token";
import { RWParams } from "@/url";
import { SliceCreator } from "../app-store";

export interface PoolSlice {
    set_pool: (pool: Pool) => void;
    pool: Pool;
    set_pool_rate_model: (map: Map<PoolToken, RateModel> | null) => void;
    pool_rate_model: Map<PoolToken, RateModel> | null;
    set_pool_lock_params: (map: Map<PoolToken, LockParams> | null) => void;
    pool_lock_params: Map<PoolToken, LockParams> | null;
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
}
export const createPoolSlice: SliceCreator<PoolSlice> = (set) => ({
    set_pool: (p) => {
        set({ pool: p }, { type: "POOL", pool: p });
        RWParams.pool = p;
    },
    pool: RWParams.pool,
    set_pool_rate_model: (m) => set({ pool_rate_model: m }, {
        type: "POOL_RATE_MODEL", rate_model: m
    }),
    pool_rate_model: null,
    set_pool_lock_params: (m) => set({ pool_lock_params: m }, {
        type: "POOL_LOCK_PARAMS", lock_params: m
    }),
    pool_lock_params: null,
    set_pool_rate_info: (m) => set({ pool_rate_info: m }, {
        type: "POOL_RATE_INFO", rate_info: m
    }),
    pool_rate_info: null,
    set_pool_util_page: (m) => set({ pool_util_page: m }, {
        type: "POOL_UTIL_PAGE", util_page: m
    }),
    pool_util_page: null,
    set_pool_util_curr: (m) => set({ pool_util_curr: m }, {
        type: "POOL_UTIL_CURR", util_curr: m
    }),
    pool_util_curr: null,
    set_pool_util: (m) => set({ pool_util: m }, {
        type: "POOL_UTIL", util: m
    }),
    pool_util: null,
    set_pool_supply: (m) => set({ pool_supply: m }, {
        type: "POOL_SUPPLY", supply: m
    }),
    pool_supply: null,
    set_pool_borrow: (m) => set({ pool_borrow: m }, {
        type: "POOL_BORROW", borrow: m
    }),
    pool_borrow: null,
    set_pool_tokens: (m) => set({ pool_tokens: m }, {
        type: "POOL_TOKENS", tokens: m
    }),
    pool_tokens: new Map(Pool.all_tokens),
});
