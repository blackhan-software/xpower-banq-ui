import { PositionContract } from "@/contract";
import { assert } from "@/function";
import { usePoolTokens, usePositionContracts } from "@/react/hook";
import { Address, Mode, Pool, PoolToken, Total } from "@/type";
import { appStore } from "@/zustand";
import { useQuery } from "@tanstack/react-query";

export function usePoolTotals() {
    const [supply] = usePoolSupply();
    const [borrow] = usePoolBorrow();
    return { supply, borrow } as const;
}
function usePoolSupply() {
    let { pool, pool_supply, set_pool_supply } = appStore();
    if (pool_supply instanceof Array) {
        pool_supply = new Map(pool_supply);
    }
    const [tokens] = usePoolTokens();
    const [position_map] = usePositionContracts(
        Mode.supply
    );
    useQuery({
        queryKey: [
            "pool-supply",
            ...tokens ?? [],
            pool,
        ],
        queryFn: async () => {
            assert(tokens, "missing tokens");
            assert(position_map, "missing positions");
            const new_map = new Map(pool_supply);
            const totals = await totals_of(
                position_map, tokens, pool,
            );
            totals.forEach(([pt, t]) => {
                new_map.set(pt, t);
            });
            set_pool_supply(new_map);
            return new_map;
        },
        enabled: Boolean(
            tokens?.length &&
            position_map?.size
        ),
    });
    return [pool_supply, set_pool_supply] as const;
}
function usePoolBorrow() {
    let { pool, pool_borrow, set_pool_borrow } = appStore();
    if (pool_borrow instanceof Array) {
        pool_borrow = new Map(pool_borrow);
    }
    const [tokens] = usePoolTokens();
    const [position_map] = usePositionContracts(
        Mode.borrow
    );
    useQuery({
        queryKey: [
            "pool-borrow", ...tokens ?? [], pool,
        ],
        queryFn: async () => {
            assert(tokens, "missing tokens");
            assert(position_map, "missing positions");
            const new_map = new Map(pool_borrow);
            const totals = await totals_of(
                position_map, tokens, pool
            );
            totals.forEach(([pt, total]) => {
                new_map.set(pt, total);
            });
            set_pool_borrow(new_map);
            return new_map;
        },
        enabled: Boolean(
            tokens?.length &&
            position_map?.size
        ),
    });
    return [pool_borrow, set_pool_borrow] as const;
}
function totals_of(
    position_map: Map<PoolToken, PositionContract>,
    tokens: Address[],
    pool: Pool,
): Promise<[PoolToken, Total][]> {
    return Promise.all(tokens
        .map((ta) => PoolToken.from(pool, ta))
        .map(async (pt) => {
            const position = position_map.get(pt);
            assert(position, "missing position");
            const total = await position.totalSupply();
            return [pt, total];
        })
    );
}
export default usePoolTotals;
