import { assert } from "@/function";
import { usePoolRateModels, usePoolTokens, usePoolUtil } from "@/react/hook";
import { Address, Pool, PoolToken, RateInfo, RateModel, Util } from "@/type";
import { appStore } from "@/zustand";
import { useQuery } from "@tanstack/react-query";

export function usePoolRateInfos() {
    let { pool, pool_rate_info, set_pool_rate_info } = appStore();
    if (pool_rate_info instanceof Array) {
        pool_rate_info = new Map(pool_rate_info);
    }
    const [model_map] = usePoolRateModels();
    const [util_map] = usePoolUtil();
    const [tokens] = usePoolTokens();
    useQuery({
        queryKey: [
            "pool-rate-infos",
            model_map?.size ?? 0,
            util_map?.size ?? 0,
            ...tokens ?? [],
            pool,
        ],
        queryFn: () => {
            assert(tokens, "missing tokens");
            assert(util_map, "missing utils");
            assert(model_map, "missing models");
            const new_map = new Map(pool_rate_info);
            const rate_info = rate_info_of(
                model_map, util_map, tokens, pool,
            );
            rate_info.forEach(([pt, ri]) => {
                new_map.set(pt, ri);
            });
            set_pool_rate_info(new_map);
            return new_map;
        },
        enabled: Boolean(
            model_map?.size &&
            util_map?.size &&
            tokens?.length
        ),
    });
    return [pool_rate_info, set_pool_rate_info] as const;
}
function rate_info_of(
    model_map: Map<PoolToken, RateModel>,
    util_map: Map<PoolToken, Util>,
    tokens: Address[],
    pool: Pool,
): [PoolToken, RateInfo][] {
    return tokens.map((ta) => {
        const pt = PoolToken.from(pool, ta);
        const util = util_map.get(pt);
        assert(util, "missing util");
        const model = model_map.get(pt);
        assert(model, "missing rate-model");
        const rate = RateInfo.from(util, model);
        assert(rate, "missing rate-info");
        return [pt, rate];
    });
}
export default usePoolRateInfos;
