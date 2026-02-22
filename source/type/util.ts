export type Util = {
    /** range: [0,1e18] ~ [0%,100%] */
    value: number;
}
export const Util = {
    from(value: bigint): Util {
        return { value: Number(value) };
    },
    eq(lhs_util?: Util | null, rhs_util?: Util | null): boolean {
        if (lhs_util?.value !== rhs_util?.value) {
            return false;
        }
        return true;
    },
}
export default Util;
