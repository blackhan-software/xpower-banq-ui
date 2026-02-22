import { VaultContract } from "@/contract";
import { assert } from "@/function";
import { usePoolTokens, usePoolTotals, useVaultContracts } from "@/react/hook";
import { Address, Pool, PoolToken, Total, Util } from "@/type";
import { appStore } from "@/zustand";
import { useQuery } from "@tanstack/react-query";

export function usePoolUtil() {
    let { pool, pool_util, set_pool_util } = appStore();
    if (pool_util instanceof Array) {
        pool_util = new Map(pool_util);
    }
    const { supply, borrow } = usePoolTotals();
    const [vault_map] = useVaultContracts();
    const [tokens] = usePoolTokens();
    useQuery({
        queryKey: [
            "pool-utils", pool,
            sum_of(supply, pool),
            sum_of(borrow, pool),
        ],
        queryFn: async () => {
            assert(tokens, "missing tokens");
            assert(vault_map, "missing vaults");
            const new_map = new Map(pool_util);
            const utils = await utils_of(
                vault_map, tokens, pool,
            );
            utils.forEach(([pt, u]) => {
                new_map.set(pt, u);
            });
            set_pool_util(new_map)
            return new_map;
        },
        enabled: Boolean(
            vault_map?.size &&
            tokens?.length
        ),
    });
    return [pool_util, set_pool_util] as const;
}
function utils_of(
    vaults: Map<PoolToken, VaultContract>,
    tokens: Address[],
    pool: Pool,
): Promise<[PoolToken, Util][]> {
    return Promise.all(tokens
        .map((ta) => PoolToken.from(pool, ta))
        .map(async (pt) => {
            const vault = vaults.get(pt);
            assert(vault, "missing vault");
            const util = await vault.util();
            return [pt, Util.from(util)];
        })
    );
}
function sum_of(
    map: Map<PoolToken, Total> | null,
    pool: Pool,
): Total {
    if (!map) {
        return 0n;
    }
    return map
        .entries()
        .filter(([pt, _]) => pt.pool === pool)
        .map(([_, t]) => t)
        .reduce((acc, t) => acc + t, 0n);
}
export default usePoolUtil;
