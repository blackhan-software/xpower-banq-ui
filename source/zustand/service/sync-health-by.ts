import { PoolContract, PositionContract } from "@/contract";
import { onAll, Unsubscribe, addressOf as x } from "@/function";
import { Account, Health, PoolAccount } from "@/type";
import { ContractRunner } from "ethers";
import { AppState } from "../app-store";
import { Store } from "../zustand-type";

/**
 * @return A zustand store w/a sync-health-by service.
 */
export function syncHealthBy(
    store: Store<AppState>, { runner, position_of }: {
        position_of: 'supplyOf' | 'borrowOf',
        runner: ContractRunner,
    },
) {
    const offs = new Map<PoolAccount, Promise<Unsubscribe>>();
    store.subscribe(async (
        next: AppState, prev: AppState
    ) => {
        if (prev.actions.includes("portfolio_health") &&
            next.actions.includes("portfolio_health") === false
        ) {
            return; // avoid infinite loop
        }
        if (next.actions.includes("portfolio_health")) {
            next.reset_actions("portfolio_health");
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
            const pool_contract = new PoolContract(x(next.pool), runner);
            const token_addresses = next.pool_tokens?.get(next.pool) ?? [];
            const token_contracts = token_addresses
                .map((ta) => pool_contract[position_of](ta))
                .map((pa) => new PositionContract(pa, runner));
            const off = onAll(token_contracts ?? [], async (
                position_contract
            ) => {
                const listener = update(
                    pool_contract,
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
    // update portfolio-health
    function update(
        pool_contract: PoolContract,
        account: Account,
    ) {
        return async (
            from: string, to: string, _amount: bigint,
        ) => {
            if (x(account) !== from && x(account) !== to) {
                return; // irrelevant transfer
            }
            const { set_portfolio_health } = store.getState();
            const { portfolio_health } = store.getState();
            const { pool } = store.getState();
            ///
            const pool_account = PoolAccount.from(pool, account);
            const new_health = await health_of(
                pool_account, pool_contract,
            );
            const old_health = portfolio_health?.get(
                pool_account
            );
            if (Health.eq(old_health, new_health)) {
                return;
            }
            const new_map = new Map(portfolio_health);
            new_map.set(pool_account, new_health);
            set_portfolio_health(new_map)
        };
    }
    return store;
}
async function health_of(
    { account }: PoolAccount,
    pool_contract: PoolContract,
): Promise<Health> {
    return Health.from(
        await pool_contract.healthOf(x(account))
    );
}
export default syncHealthBy;
