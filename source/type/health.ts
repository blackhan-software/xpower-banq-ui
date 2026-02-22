import { CONTRACT_RUN } from "@/constant";
import { TokenInfo } from "@/type";
import { v } from "@/function";
import Decimal from "decimal.js";

export type Health = {
    borrow: bigint;
    supply: bigint;
}
export const Health = {
    /** @returns the health from an array */
    from([borrow, supply]: [bigint, bigint]): Health {
        return { borrow, supply };
    },
    /** @returns the health ratio */
    ratio(health: Health): number {
        if (health.borrow > 0n) {
            const borrow = new Decimal(health.borrow.toString());
            const supply = new Decimal(health.supply.toString());
            return supply.div(borrow).toNumber();
        }
        return Infinity;
    },
    /** @returns the weighted net asset value */
    wnav(health: Health, tokens: TokenInfo[]): number {
        const weights_max = v(CONTRACT_RUN) > v("10a") ? 255 : 1;
        const weights_sum = tokens.reduce((acc, t) => {
            const { weights: [borrow] } = t;
            return acc + borrow;
        }, 0);
        const weight_avg = (nav: Decimal) => {
            return nav.mul(tokens.length).mul(weights_max).div(weights_sum);
        };
        const borrow = new Decimal(health.borrow.toString());
        const supply = new Decimal(health.supply.toString());
        return weight_avg(supply.sub(borrow)).toNumber();
    },
    /** @returns an empty health */
    init(): Health {
        return { borrow: 0n, supply: 0n };
    },
    /** @returns equality */
    eq(lhs?: Health, rhs?: Health): boolean {
        return lhs?.borrow === rhs?.borrow &&
            lhs?.supply === rhs?.supply;
    },
}
export default Health;
