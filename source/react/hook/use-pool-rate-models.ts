import { PositionContract } from "@/contract";
import { assert } from "@/function";
import { usePoolTokens, usePositionContracts, useTellerMode } from "@/react/hook";
import { Address, Pool, PoolToken, RateModel } from "@/type";
import { appStore } from "@/zustand";
import { useQuery } from "@tanstack/react-query";

export function usePoolRateModels() {
    let { pool, pool_rate_model, set_pool_rate_model } = appStore();
    if (pool_rate_model instanceof Array) {
        pool_rate_model = new Map(pool_rate_model);
    }
    const [mode] = useTellerMode();
    const [tokens] = usePoolTokens();
    const [position_map] = usePositionContracts(mode);
    useQuery({
        queryKey: [
            "pool-rate-models",
            ...tokens ?? [],
            pool,
        ],
        queryFn: async () => {
            assert(tokens, "missing tokens");
            assert(position_map, "missing positions");
            const new_map = new Map(pool_rate_model);
            const rate_model = await rate_model_of(
                position_map, tokens, pool,
            );
            rate_model.forEach(([pt, rm]) => {
                new_map.set(pt, rm);
            });
            set_pool_rate_model(new_map);
            return new_map;
        },
        enabled: Boolean(
            tokens?.length &&
            position_map?.size
        ),
    });
    return [pool_rate_model, set_pool_rate_model] as const;
}
function rate_model_of(
    position_map: Map<PoolToken, PositionContract>,
    tokens: Address[],
    pool: Pool,
): Promise<[PoolToken, RateModel][]> {
    return Promise.all(tokens
        .map((ta) => PoolToken.from(pool, ta))
        .map(async (pt) => {
            const position = position_map.get(pt);
            assert(position, "missing position");
            const rate_model = await position.model();
            return [pt, RateModel.from(rate_model)];
        })
    );
}
export default usePoolRateModels;
