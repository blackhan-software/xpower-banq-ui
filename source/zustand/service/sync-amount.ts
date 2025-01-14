import { ERC20Contract } from "@/contract";
import { onAll, Unsubscribe, addressOf as x } from "@/function";
import { Account, Address, PoolAccount, Position } from "@/type";
import { ContractRunner } from "ethers";
import { AppState } from "../app-store";
import { Store } from "../zustand-type";

/**
 * @return A zustand store w/a sync-amount service.
 */
export function syncPortfolioAmount(
    store: Store<AppState>, { runner }: {
        runner: ContractRunner,
    },
) {
    const offs = new Map<PoolAccount, Promise<Unsubscribe>>();
    store.subscribe(async (
        next: AppState, prev: AppState
    ) => {
        if (prev.actions.includes("portfolio_amount") &&
            next.actions.includes("portfolio_amount") === false
        ) {
            return; // avoid infinite loop
        }
        if (next.actions.includes("portfolio_amount")) {
            next.reset_actions("portfolio_amount");
            return; // avoid infinite loop
        }
        // remove old listener(s)
        if ((prev.wallet_account !== null && prev.pool !== 0n) &&
            (prev.wallet_account !== next.wallet_account || prev.pool !== next.pool)
        ) {
            const pa_prev = PoolAccount.from(
                prev.pool, prev.wallet_account,
            );
            const off = offs.get(pa_prev);
            await off?.then((un) => un());
            offs.delete(pa_prev);
        }
        // attach new listener(s)
        if ((next.wallet_account !== null && next.pool !== 0n) &&
            (next.wallet_account !== prev.wallet_account || next.pool !== prev.pool)
        ) {
            const token_addresses = next.pool_tokens?.get(next.pool) ?? [];
            const token_contracts = token_addresses.map(
                (ta) => [new ERC20Contract(ta, runner), ta] as const
            );
            const off = onAll(token_contracts, async (
                [position_contract, token]
            ) => {
                const listener = update(
                    position_contract,
                    next.wallet_account ?? 0n,
                    token,
                );
                await position_contract.onTransfer(listener);
                return () => {
                    position_contract.offTransfer(listener);
                }
            });
            const pa_next = PoolAccount.from(
                next.pool, next.wallet_account,
            );
            offs.set(pa_next, off);
        }
    });
    // update portfolio amount-positions
    function update(
        position_contract: ERC20Contract,
        account: Account,
        token: Address,
    ) {
        return async (
            from: string, to: string, _amount: bigint,
        ) => {
            if (x(account) !== from && x(account) !== to) {
                return; // irrelevant transfer
            }
            const { set_portfolio_amount } = store.getState();
            const { portfolio_amount } = store.getState();
            const { pool } = store.getState();
            ///
            const balance = await position_contract.balanceOf(x(account));
            const pool_account = PoolAccount.from(pool, account);
            const old_positions = portfolio_amount?.get(pool_account) ?? [];
            const new_positions = old_positions.map(
                (p) => (p.address !== token) ? p : {
                    ...p, amount: balance,
                }
            );
            if (Position.eq(old_positions, new_positions)) {
                return;
            }
            const new_map = new Map(portfolio_amount);
            new_map.set(pool_account, new_positions)
            set_portfolio_amount(new_map);
        };
    }
    return store;
}
export default syncPortfolioAmount;
