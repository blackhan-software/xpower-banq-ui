import { Address } from "@/type";
import { appStore } from "@/zustand";

export function usePoolTokens(
    pool_address?: Address,
) {
    let { pool, pool_tokens } = appStore();
    if (pool_tokens instanceof Array) {
        pool_tokens = new Map(pool_tokens);
    }
    if (pool_address) {
        const address = BigInt(pool_address.toString());
        // console.assert(
        //     pool === address, "address mismatch"
        // );
        pool = address;
    }
    return [pool_tokens?.get(pool) ?? null] as const;
}
export default usePoolTokens;
