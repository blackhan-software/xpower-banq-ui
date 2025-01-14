import { NULL_ADDRESS, P000_ADDRESS, P001_ADDRESS, P002_ADDRESS, P003_ADDRESS } from "@/constant";
import { Cycle } from "@/function";
import { Pool } from "./pool";

export type PoolList = Array<{
    visible?: boolean | null | undefined;
    group?: number | null | undefined;
    name?: string | null | undefined;
    pool: Pool;
}>
export const PoolList = {
    /**
     * @returns list of pools for the given query options.
     */
    query(options?: Partial<PoolList[0]>, list = POOL_LIST): PoolList {
        if (options?.visible !== undefined) list = list.filter(
            ({ visible: v }) => v === options.visible
        );
        if (options?.group !== undefined) list = list.filter(
            ({ group: g }) => g === options.group
        );
        if (options?.name !== undefined) list = list.filter(
            ({ name: n }) => n === options.name
        );
        if (options?.pool !== undefined) list = list.filter(
            ({ pool: p }) => p === options.pool
        );
        return list;
    },
    /**
     * @returns next pool (in the same group).
     */
    next(pool: Pool, visible = true): Pool | null {
        const [item] = PoolList.query({ pool });
        const items = PoolList.query({
            group: item?.group, visible,
        });
        return Cycle.next(
            items.map(({ pool }) => pool), pool
        );
    },
    /**
     * @returns previous pool (in the same group).
     */
    prev(pool: Pool, visible = true): Pool | null {
        const [item] = PoolList.query({ pool });
        const items = PoolList.query({
            group: item?.group, visible,
        });
        return Cycle.prev(
            items.map(({ pool }) => pool), pool
        );
    },
};
const POOL_LIST: PoolList = [
    { pool: P000_ADDRESS, visible: true, group: 0, name: "APOW:XPOW" },
    { pool: P001_ADDRESS, visible: true, group: 0, name: "APOW:AVAX" },
    { pool: P002_ADDRESS, visible: true, group: 0, name: "APOW:USDC" },
    { pool: P003_ADDRESS, visible: true, group: 0, name: "APOW:USDt" },
    { pool: NULL_ADDRESS, visible: null }, // separator
];
export default PoolList;
