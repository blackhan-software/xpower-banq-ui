import { assert, RefManager, addressOf as x } from "@/function";
import { Address } from "./address";
import { Token } from "./token";
import { Pool } from "./pool";

const REF_MANAGER = new RefManager<PoolToken>(
    ({ pool, token: t }) => `${x(pool)}:${x(t.address)}`,
);

export type PoolToken = {
    pool: Pool;
    token: Token;
};
export const PoolToken = {
    from(pool: Pool | Address, token: Token | Address): PoolToken {
        if (Address.isAddress(pool)) {
            assert(pool instanceof Promise === false);
            pool = BigInt(pool.toString());
        }
        if (Address.isAddress(token)) {
            assert(token instanceof Promise === false);
            token = Token.from(token);
        }
        return REF_MANAGER.get({ pool, token });
    },
    map<V>(
        map: Array<[PoolToken, V]> | Map<PoolToken, V> | null
    ): Map<PoolToken, V> | null {
        if (map instanceof Array) {
            return new Map(map.map(([pt, v]) =>
                [this.from(pt.pool, pt.token), v] as const
            ));
        }
        if (map instanceof Map) {
            return new Map(map.entries().map(([pt, v]) =>
                [this.from(pt.pool, pt.token), v] as const
            ));
        }
        return null;
    },
};
export default PoolToken;
