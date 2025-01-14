import { PoolContract, PositionContract } from "@/contract";
import { onAll, Unsubscribe, addressOf as x } from "@/function";
import { Account, Address, PoolAccount, PoolToken, Position } from "@/type";
import { ContractRunner } from "ethers";
import { AppState } from "../app-store";
import { Store } from "../zustand-type";

/**
 * @return A zustand store w/a sync-borrow service.
 */
export function syncPortfolioBorrow(
    store: Store<AppState>, { runner }: {
        runner: ContractRunner,
    },
) {
    const offs = new Map<PoolAccount, Promise<Unsubscribe>>();
    store.subscribe(async (
        next: AppState, prev: AppState
    ) => {
        if (prev.actions.includes("portfolio_borrow") &&
            next.actions.includes("portfolio_borrow") === false
        ) {
            return; // avoid infinite loop
        }
        if (next.actions.includes("portfolio_borrow")) {
            next.reset_actions("portfolio_borrow");
            return; // avoid infinite loop
        }
        // remove old listener(s)
        if ((prev.wallet_account !== null && prev.pool !== 0n) &&
            (prev.wallet_account !== next.wallet_account || prev.pool !== next.pool)
        ) {
            const pa_prev = PoolAccount.from(
                prev.pool, prev.wallet_account
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
            const token_contracts = token_addresses.map((ta) =>
                [pool_contract.borrowOf(ta), ta] as const
            ).map(([pa, ta]) =>
                [new PositionContract(pa, runner), ta] as const
            );
            const off = onAll(token_contracts, async (
                [position_contract, token_address]
            ) => {
                const listener = update(
                    position_contract,
                    token_address,
                    next.wallet_account ?? 0n,
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
    // update portfolio borrow-positions
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
            const { set_portfolio_borrow } = store.getState();
            const { portfolio_borrow } = store.getState();
            const { set_pool_borrow } = store.getState();
            const { pool_borrow } = store.getState();
            const { pool } = store.getState();
            ///
            const [balance, locked, lockedTotal, total] = await Promise.all([
                position_contract.balanceOf(x(account)),
                position_contract.lockOf(x(account)),
                position_contract.lockOf(x(0n)),
                position_contract.totalSupply(),
            ]);
            const pool_account = PoolAccount.from(pool, account);
            const old_positions = portfolio_borrow?.get(pool_account) ?? [];
            const new_positions = old_positions.map(
                (p) => (p.address !== token_address) ? p : {
                    ...p, amount: balance,
                    locked, lockedTotal,
                    borrow: total,
                }
            );
            if (Position.eq(old_positions, new_positions)) {
                return;
            }
            /// portfolio-borrow
            {
                const new_map = new Map(portfolio_borrow);
                new_map.set(pool_account, new_positions);
                set_portfolio_borrow(new_map);
            }
            /// pool-borrow
            {
                const pool_token = PoolToken.from(
                    pool, token_address
                );
                const new_map = new Map(pool_borrow);
                new_map.set(pool_token, total);
                set_pool_borrow(new_map);
            }
        };
    }
    return store;
}
export default syncPortfolioBorrow;
