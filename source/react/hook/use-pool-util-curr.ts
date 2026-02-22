import { useVaultContract } from "@/react/hook";
import { PoolToken, Token, Util } from "@/type";
import { appStore } from "@/zustand";
import { useEffect } from "react";

export function usePoolUtilCurr(
    token: Token,
) {
    let { pool, pool_util_curr, set_pool_util_curr } = appStore();
    if (pool_util_curr instanceof Array) {
        pool_util_curr = new Map(pool_util_curr);
    }
    const [vault] = useVaultContract(token);
    useEffect(() => {
        vault?.util().then(Util.from).then((util) => {
            const new_map = new Map(pool_util_curr);
            const pool_token = PoolToken.from(
                pool, token.address,
            );
            new_map.set(pool_token, util);
            set_pool_util_curr(new_map);
        });
    }, [
        pool_util_curr,
        vault,
    ]);
    return [pool_util_curr, set_pool_util_curr] as const;
}
export default usePoolUtilCurr;
