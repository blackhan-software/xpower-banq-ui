import { UNIT } from "@/constant";
import { assert, buffered_ms, range } from "@/function";
import { Address, LockParams, Pool, PoolAccount, PoolToken, Position, Quote, RateInfo } from "@/type";
import { ContractRunner } from "ethers";
import { AppState } from "../app-store";
import { Store } from "../zustand-type";
import { withActionGuard } from "./action-guard";

/**
 * @return A zustand store w/a sync-yields service.
 */
export function syncPortfolioYields(
    store: Store<AppState>, { runner: _ }: {
        runner: ContractRunner,
    },
) {
    const on_error = (n: string, e: Error) => store.getState().set_error(n, e);
    store.subscribe(buffered_ms(withActionGuard("portfolio_yields", (
        next: AppState, _prev: AppState
    ) => {
        /// pool-account
        const { pool, wallet_account } = next;
        if (!pool || !wallet_account) {
            return;
        }
        const pool_account = PoolAccount.from(
            pool, wallet_account
        );
        /// pool-tokens
        const { pool_tokens } = next;
        const tokens = pool_tokens?.get(pool);
        if (!tokens) {
            return;
        }
        /// pool-rate-info & oracle-quote
        const { pool_rate_info, oracle_quote } = next;
        if (!pool_rate_info || !oracle_quote) {
            return;
        }
        if (oracle_quote?.size !== pool_rate_info?.size) {
            return;
        }
        /// portfolio-supply & portfolio-borrow
        const { portfolio_supply, portfolio_borrow } = next;
        const supply = portfolio_supply?.get(pool_account);
        const borrow = portfolio_borrow?.get(pool_account);
        if (!supply || !borrow) {
            return;
        }
        /// pool-lock-params
        const { pool_lock_params } = next;
        /// apy-mean
        const new_yield = apy_mean(
            pool_lock_params,
            pool_rate_info,
            oracle_quote,
            supply,
            borrow,
            tokens,
            pool,
        );
        /// portfolio-yield(s)
        const { portfolio_yields, set_portfolio_yields } = next;
        const old_yield = portfolio_yields?.get(pool_account);
        if (old_yield === new_yield) {
            return;
        }
        const new_map = new Map(portfolio_yields);
        new_map.set(pool_account, new_yield);
        set_portfolio_yields(new_map);
    }, on_error)));
    return store;
}
function apy_mean(
    lock_map: Map<PoolToken, LockParams> | null,
    rate_map: Map<PoolToken, RateInfo>,
    quote_map: Map<PoolToken, Quote>,
    supply: Position[],
    borrow: Position[],
    tokens: Address[],
    pool: Pool,
) {
    const pos_weights = position_weights(
        quote_map, supply, borrow, tokens, pool,
    );
    const weights_sum = pos_weights.reduce(
        (acc, w) => acc + w, 0,
    );
    if (weights_sum === 0) {
        return 0;
    }
    const apy_array = position_apys(
        lock_map, rate_map, supply, borrow, tokens, pool,
    );
    const apy_total = apy_array.reduce((acc, apy_value, i) => {
        assert(typeof pos_weights[i] === "number");
        return acc + apy_value * pos_weights[i];
    }, 0);
    return apy_total / (weights_sum * UNIT);
}
function position_weights(
    quote_map: Map<PoolToken, Quote>,
    supply: Position[],
    borrow: Position[],
    tokens: Address[],
    pool: Pool,
) {
    return tokens.map((ta, i) => {
        const pt = PoolToken.from(pool, ta);
        const quote = quote_map.get(pt);
        assert(quote, `missing quotes`);
        const su_i = supply[i];
        assert(su_i?.address == ta, "token mismatch");
        const bo_i = borrow[i];
        assert(bo_i?.address == ta, "token mismatch");
        const su_amount = Position.amount(su_i);
        assert(su_amount >= 0, "negative supply-amount");
        const bo_amount = Position.amount(bo_i);
        assert(bo_amount >= 0, "negative borrow-amount");
        const weight = quote.mid * Math.abs(su_amount - bo_amount);
        assert(weight >= 0, "negative weight");
        return weight;
    });
}
function position_apys(
    lock_map: Map<PoolToken, LockParams> | null,
    rate_map: Map<PoolToken, RateInfo>,
    supply: Position[],
    borrow: Position[],
    tokens: Address[],
    pool: Pool,
) {
    const apy_at = position_apy(
        lock_map, rate_map, supply, borrow, pool,
    );
    return Array.from(
        range(tokens.length).map(apy_at)
    );
}
function position_apy(
    lock_map: Map<PoolToken, LockParams> | null,
    rate_map: Map<PoolToken, RateInfo>,
    supply: Position[],
    borrow: Position[],
    pool: Pool,
) {
    return (index: number) => {
        const su = supply[index];
        assert(su, `missing supply-position`);
        const bo = borrow[index];
        assert(bo, `missing borrow-position`);
        const su_poto = PoolToken.from(pool, su.address);
        const su_rate = rate_map.get(su_poto);
        assert(su_rate, `missing supply-rate`);
        const bo_poto = PoolToken.from(pool, bo.address);
        const bo_rate = rate_map.get(bo_poto);
        assert(bo_rate, `missing borrow-rate`);
        const { sura: su_apy } = su_rate;
        assert(su_apy >= 0, "negative supply-apy");
        const { bora: bo_apy } = bo_rate;
        assert(bo_apy >= 0, "negative borrow-apy");
        const su_amount = Position.amount(su);
        assert(su_amount >= 0, "negative supply-amount");
        const bo_amount = Position.amount(bo);
        assert(bo_amount >= 0, "negative borrow-amount");
        // lock bonus/malus adjustment
        const lock = lock_map?.get(su_poto) ?? ({
            bonus: 0, malus: 0
        });
        const su_lock_ratio = su.amount > 0n
            ? Number(su.locked) / Number(su.amount) : 0;
        const bo_lock_ratio = bo.amount > 0n
            ? Number(bo.locked) / Number(bo.amount) : 0;
        const su_apy_my
            = su_apy * (1 + su_lock_ratio * lock.bonus / UNIT);
        const bo_apy_my
            = bo_apy * (1 - bo_lock_ratio * lock.malus / UNIT);
        const su_mul = su_apy_my * su_amount;
        const bo_mul = bo_apy_my * bo_amount;
        const ps_sum = su_amount + bo_amount;
        if (ps_sum > 0) {
            return (su_mul - bo_mul) / ps_sum;
        }
        return 0;
    };
}
export default syncPortfolioYields;
