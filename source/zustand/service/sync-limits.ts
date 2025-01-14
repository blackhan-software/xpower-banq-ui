import { buffered_ms } from "@/function";
import { Address, Health, Limit, PoolAccount, PoolToken, Quote, Token, TokenInfo } from "@/type";
import { ContractRunner } from "ethers";
import { AppState } from "../app-store";
import { Store } from "../zustand-type";

/**
 * @return A zustand store w/a sync-limits service.
 */
export function syncPortfolioLimits(
    store: Store<AppState>, { runner: _ }: {
        runner: ContractRunner,
    },
) {
    store.subscribe(buffered_ms((
        next: AppState, prev: AppState
    ) => {
        if (prev.actions.includes("portfolio_limits") &&
            next.actions.includes("portfolio_limits") === false
        ) {
            return; // avoid infinite loop
        }
        if (next.actions.includes("portfolio_limits")) {
            next.reset_actions("portfolio_limits");
            return; // avoid infinite loop
        }
        /// pool-account
        const { pool, wallet_account } = next;
        if (!pool || !wallet_account) {
            return;
        }
        const pool_account = PoolAccount.from(
            pool, wallet_account,
        );
        /// pool-tokens
        const { pool_tokens } = next;
        const tokens = pool_tokens?.get(pool);
        if (!tokens) {
            return;
        }
        /// limits-of
        const { portfolio_health } = next;
        const { oracle_quote } = next;
        const new_limits = limits_of(
            portfolio_health,
            oracle_quote,
            pool_account,
            tokens,
        );
        if (!new_limits) {
            return;
        }
        /// portfolio-limits
        const { portfolio_limits, set_portfolio_limits } = next;
        const old_limits = portfolio_limits?.get(pool_account);
        if (Limit.eq(old_limits, new_limits)) {
            return;
        }
        const new_map = new Map(portfolio_limits);
        new_map.set(pool_account, new_limits);
        set_portfolio_limits(new_map);
    }));
    return store;
}
/**
 * @returns 99.9% of portfolio-limits w.r.t. tokens
 */
const limits_of = (
    portfolio_health: AppState["portfolio_health"],
    oracle_quote: AppState["oracle_quote"],
    pool_account: PoolAccount,
    tokens: Address[],
) => {
    const health = portfolio_health?.get(
        pool_account
    );
    if (!health) {
        return null;
    }
    const infos = tokens.map(TokenInfo.from);
    const wnav = Health.wnav(health, infos);
    const limits = [] as Limit[];
    for (const info of infos) {
        const pool_token = PoolToken.from(
            pool_account.pool, info.address,
        );
        const quote = oracle_quote?.get(pool_token);
        if (!quote) return null; // not available
        const amount = limit_of(wnav, infos, {
            quote, unit: Token.unit(info),
        });
        limits.push({ amount, token: info });
    }
    return limits;
}
/**
 * @returns 99.9% of portfolio-limit w.r.t. token
 */
const limit_of = (
    wnav: number, tokens: Token[], { quote, unit }: {
        quote: Quote, // current token's quote
        unit: number, // current token's unit
    },
    [mul, div] = [1e3 - 1, 1e3] as const
) => {
    return (mul * wnav * tokens.length) / (div * quote.ask * unit);
}
export default syncPortfolioLimits;
