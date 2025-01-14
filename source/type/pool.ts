import { APOW_ADDRESS, AVAX_ADDRESS, P000_ADDRESS, P001_ADDRESS, P002_ADDRESS, P003_ADDRESS, USDC_ADDRESS, USDT_ADDRESS, XPOW_ADDRESS } from "@/constant";
import { addressOf as x } from "@/function";
import { Address, PoolList } from "@/type";

const POOL_CACHE = new Map<string, Pool>(); // name => pool
const NAME_CACHE = new Map<Pool, string>(); // pool => name

export type Pool = bigint;
export const Pool = {
    from(name: string): Pool {
        let pool = POOL_CACHE.get(name);
        if (typeof pool !== "bigint") {
            const [item] = PoolList.query({ name });
            pool = item?.pool ?? BigInt(0);
            POOL_CACHE.set(name, pool);
        }
        return pool;
    },
    name(pool: Pool): string {
        let name = NAME_CACHE.get(pool);
        if (typeof name !== "string") {
            const [item] = PoolList.query({ pool });
            name = item?.name ?? "---";
            NAME_CACHE.set(pool, name);
        }
        return name;
    },
    token(pool: Pool, index = 0): Address | null {
        const tokens = Pool.tokens(pool);
        return tokens?.[index] ?? null;
    },
    tokens(pool: Pool): Address[] | null {
        return Pool.all_tokens.get(pool) ?? null;
    },
    all_tokens: new Map([
        [P000_ADDRESS, [
            x(APOW_ADDRESS),
            x(XPOW_ADDRESS),
        ]],
        [P001_ADDRESS, [
            x(APOW_ADDRESS),
            x(AVAX_ADDRESS),
        ]],
        [P002_ADDRESS, [
            x(APOW_ADDRESS),
            x(USDC_ADDRESS),
        ]],
        [P003_ADDRESS, [
            x(APOW_ADDRESS),
            x(USDT_ADDRESS),
        ]],
    ]),
}
export default Pool;
