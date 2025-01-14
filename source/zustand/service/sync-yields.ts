import { UNIT } from "@/constant";
import { assert, buffered_ms, range } from "@/function";
import { Address, Pool, PoolAccount, PoolToken, Position, Quote, RateInfo } from "@/type";
import { ContractRunner } from "ethers";
import { AppState } from "../app-store";
import { Store } from "../zustand-type";

/**
 * @return A zustand store w/a sync-yields service.
 */
export function syncPortfolioYields(
    store: Store<AppState>, { runner: _ }: {
        runner: ContractRunner,
    },
) {
    store.subscribe(buffered_ms((
        next: AppState, prev: AppState
    ) => {
        if (prev.actions.includes("portfolio_yields") &&
            next.actions.includes("portfolio_yields") === false
        ) {
            return; // avoid infinite loop
        }
        if (next.actions.includes("portfolio_yields")) {
            next.reset_actions("portfolio_yields");
            return; // avoid infinite loop
        }
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
        /// apy-mean
        const new_yield = apy_mean(
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
    }));
    return store;
}
function apy_mean(
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
    const apy_array = position_apys(
        rate_map, supply, borrow, tokens, pool,
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
    rate_map: Map<PoolToken, RateInfo>,
    supply: Position[],
    borrow: Position[],
    tokens: Address[],
    pool: Pool,
) {
    const apy_at = position_apy(
        rate_map, supply, borrow, pool,
    );
    return Array.from(
        range(tokens.length).map(apy_at)
    );
}
function position_apy(
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
        const su_mul = su_apy * su_amount;
        const bo_mul = bo_apy * bo_amount;
        const ps_sum = su_amount + bo_amount;
        if (ps_sum > 0) {
            return (su_mul - bo_mul) / ps_sum;
        }
        return 0;
    };
}
export default syncPortfolioYields;
