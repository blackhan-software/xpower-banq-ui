import { PoolContract, PositionContract } from "@/contract";
import { onAll, Unsubscribe, addressOf as x } from "@/function";
import { Account, Address, PoolAccount, PoolToken, Position } from "@/type";
import { ContractRunner } from "ethers";
import { AppState } from "../app-store";
import { Store } from "../zustand-type";
import { withActionGuard } from "./action-guard";
import { caught } from "./error/caught";

/**
 * @return A zustand store w/a sync-position-by service.
 */
export function syncPortfolioBy(
    store: Store<AppState>, { runner, position_of }: {
        position_of: 'supplyOf' | 'borrowOf',
        runner: ContractRunner,
    },
) {
    const is_supply = position_of === 'supplyOf';
    const action = is_supply ? "portfolio_supply" : "portfolio_borrow";
    const label = is_supply ? "sync-supply" : "sync-borrow";
    const on_error = (n: string, e: Error | null) => store.getState().set_error(n, e);
    const offs = new Map<PoolAccount, Promise<Unsubscribe>>();
    store.subscribe(withActionGuard(action, async (
        next: AppState, prev: AppState
    ) => {
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
            const pool_contract = new PoolContract(x(next.pool), runner);
            const token_addresses = next.pool_tokens?.get(next.pool) ?? [];
            const token_contracts = await Promise.all(
                token_addresses.map(async (ta) => [
                    new PositionContract(await pool_contract[position_of](ta), runner), ta,
                ] as const)
            );
            const off = onAll(token_contracts, async (
                [position_contract, token_address]
            ) => {
                const listener = update(
                    position_contract,
                    token_address,
                    next.wallet_account ?? 0n,
                );
                const [wrapped, cancel_retry] = caught(
                    label, listener, on_error,
                );
                await position_contract.onTransfer(wrapped);
                return () => {
                    cancel_retry();
                    position_contract.offTransfer(wrapped);
                }
            });
            const pa_next = PoolAccount.from(
                next.pool, next.wallet_account,
            );
            offs.set(pa_next, off);
        }
    }, on_error));
    // update portfolio positions
    function update(
        position_contract: PositionContract,
        token_address: Address,
        account: Account,
    ) {
        return async (
            from: string, to: string, _amount: bigint,
        ) => {
            if (x(account) !== from && x(account) !== to) {
                return; // irrelevant transfer
            }
            const state = store.getState();
            const { pool } = state;
            ///
            const [balance, locked, lockedTotal, total] = await Promise.all([
                position_contract.balanceOf(x(account)),
                position_contract.lockOf(x(account)),
                position_contract.lockOf(x(0n)),
                position_contract.totalSupply(),
            ]);
            store.getState().set_error(label, null);
            const pool_account = PoolAccount.from(pool, account);
            const portfolio = is_supply ? state.portfolio_supply : state.portfolio_borrow;
            const old_positions = portfolio?.get(pool_account) ?? [];
            const new_positions = old_positions.map(
                (p) => (p.address !== token_address) ? p : {
                    ...p, amount: balance,
                    locked, lockedTotal,
                    ...(is_supply
                        ? { supply: total }
                        : { borrow: total }),
                }
            );
            if (Position.eq(old_positions, new_positions)) {
                return;
            }
            /// portfolio
            {
                const new_map = new Map(portfolio);
                new_map.set(pool_account, new_positions);
                if (is_supply) {
                    state.set_portfolio_supply(new_map);
                } else {
                    state.set_portfolio_borrow(new_map);
                }
            }
            /// pool total
            {
                const pool_token = PoolToken.from(
                    pool, token_address
                );
                const pool_total = is_supply ? state.pool_supply : state.pool_borrow;
                const new_map = new Map(pool_total);
                new_map.set(pool_token, total);
                if (is_supply) {
                    state.set_pool_supply(new_map);
                } else {
                    state.set_pool_borrow(new_map);
                }
            }
        };
    }
    return store;
}
export default syncPortfolioBy;
