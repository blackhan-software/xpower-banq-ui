import { PositionContract } from "@/contract";
import { assert } from "@/function";
import { usePoolTokens, usePositionContracts } from "@/react/hook";
import { Address, LockParams, Mode, Pool, PoolToken } from "@/type";
import { appStore } from "@/zustand";
import { useQuery } from "@tanstack/react-query";

export function usePoolLockParams() {
    let { pool, pool_lock_params, set_pool_lock_params } = appStore();
    if (pool_lock_params instanceof Array) {
        pool_lock_params = new Map(pool_lock_params);
    }
    const [tokens] = usePoolTokens();
    const [su_position_map] = usePositionContracts(Mode.supply);
    const [bo_position_map] = usePositionContracts(Mode.borrow);
    useQuery({
        queryKey: [
            "pool-lock-params",
            ...tokens ?? [],
            pool,
        ],
        queryFn: async () => {
            assert(tokens, "missing tokens");
            assert(su_position_map, "missing supply-positions");
            assert(bo_position_map, "missing borrow-positions");
            const new_map = new Map(pool_lock_params);
            const lock_params = await lock_params_of(
                su_position_map, bo_position_map, tokens, pool,
            );
            lock_params.forEach(([pt, lp]) => {
                new_map.set(pt, lp);
            });
            set_pool_lock_params(new_map);
            return new_map;
        },
        enabled: Boolean(
            tokens?.length &&
            su_position_map?.size &&
            bo_position_map?.size
        ),
    });
    return [pool_lock_params, set_pool_lock_params] as const;
}
function lock_params_of(
    su_position_map: Map<PoolToken, PositionContract>,
    bo_position_map: Map<PoolToken, PositionContract>,
    tokens: Address[],
    pool: Pool,
): Promise<[PoolToken, LockParams][]> {
    return Promise.all(tokens
        .map((ta) => PoolToken.from(pool, ta))
        .map(async (pt) => {
            const su_position = su_position_map.get(pt);
            assert(su_position, "missing supply-position");
            const bo_position = bo_position_map.get(pt);
            assert(bo_position, "missing borrow-position");
            const [bonus, malus] = await Promise.all([
                su_position.parameterOf(0x20n),
                bo_position.parameterOf(0x40n),
            ]);
            return [pt, LockParams.from(bonus, malus)];
        })
    );
}
export default usePoolLockParams;
