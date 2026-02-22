import { RefManager, addressOf as x } from "@/function";
import { Account } from "./account";
import { Pool } from "./pool";

const REF_MANAGER = new RefManager<PoolAccount>(
    ({ pool, account }) => `${x(pool)}:${x(account)}`,
);

export type PoolAccount = {
    pool: Pool;
    account: Account;
};
export const PoolAccount = {
    from(pool: Pool, account: Account): PoolAccount {
        return REF_MANAGER.get({ pool, account });
    },
    map<V>(
        map: Array<[PoolAccount, V]> | Map<PoolAccount, V> | null
    ): Map<PoolAccount, V> | null {
        if (map instanceof Array) {
            return new Map(map.map(([pa, v]) =>
                [this.from(pa.pool, pa.account), v] as const
            ));
        }
        if (map instanceof Map) {
            return new Map(map.entries().map(([pa, v]) =>
                [this.from(pa.pool, pa.account), v] as const
            ));
        }
        return null;
    },
};
export default PoolAccount;
