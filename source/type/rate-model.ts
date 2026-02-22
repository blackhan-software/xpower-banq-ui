export type RateModel = {
    /** rate at optimum, e.g. 90% */
    rate: number;
    /** spread of rates, e.g. 1% */
    spread: number;
    /** util at optimum, e.g. 10% */
    util: number;
}
export const RateModel = {
    from(model_rsu: [bigint, bigint, bigint]): RateModel {
        const r = Number(model_rsu[0]);
        const s = Number(model_rsu[1]);
        const u = Number(model_rsu[2]);
        return {
            rate: r,
            spread: s,
            util: u,
        };
    },
    init: (): RateModel => ({
        rate: 0,
        spread: 0,
        util: 0,
    }),
}
export default RateModel;
