import { Nullable } from "@/type";
import { PoolAccount } from "@/type/pool-account";
import { PoolToken } from "@/type/pool-token";
import type { AppState } from "./app-store";

/**
 * Deserialize Map fields from session storage JSON.
 */
export function stateOf(
    s?: Nullable<AppState> | undefined,
) {
    if (s) {
        // pool-token keyed
        s.oracle_quote = PoolToken.map(s.oracle_quote);
        s.pool_borrow = PoolToken.map(s.pool_borrow);
        s.pool_lock_params = PoolToken.map(s.pool_lock_params);
        s.pool_rate_info = PoolToken.map(s.pool_rate_info);
        s.pool_rate_model = PoolToken.map(s.pool_rate_model);
        s.pool_supply = PoolToken.map(s.pool_supply);
        s.pool_util_page = PoolToken.map(s.pool_util_page);
        s.pool_util_curr = PoolToken.map(s.pool_util_curr);
        s.pool_util = PoolToken.map(s.pool_util);
        // pool-account keyed
        s.portfolio_amount = PoolAccount.map(s.portfolio_amount);
        s.portfolio_borrow = PoolAccount.map(s.portfolio_borrow);
        s.portfolio_health = PoolAccount.map(s.portfolio_health);
        s.portfolio_limits = PoolAccount.map(s.portfolio_limits);
        s.portfolio_supply = PoolAccount.map(s.portfolio_supply);
        s.portfolio_yields = PoolAccount.map(s.portfolio_yields);
        // plain map
        s.pool_tokens = new Map(s.pool_tokens);
    }
    return s;
}
export default stateOf;
