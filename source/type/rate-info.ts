import { UNIT } from "@/constant";
import { RateModel, Util, Rate } from "@/type";

export type RateInfo = {
    /** utilization */
    util: Util;
    /** supply-rate */
    sura: Rate;
    /** borrow-rate */
    bora: Rate;
};
export const RateInfo = {
    from: (util: Util, model: RateModel): RateInfo => {
        return usb(util, model);
    },
    init: (): RateInfo => ({
        util: { value: 0 },
        sura: 0,
        bora: 0,
    }),
}
function usb(
    util: Util,
    model: RateModel,
): RateInfo {
    const sura = supply_rate(util, model);
    const bora = borrow_rate(util, model);
    return {
        util: util,
        sura: sura,
        bora: bora,
    };
}
function supply_rate(
    util: Util,
    model: RateModel,
) {
    const rate = rate_by(
        util.value,
        model.util,
        model.rate,
    );
    const less = UNIT - model.spread;
    const sura = (rate * less) / UNIT;
    return sura;
}
function borrow_rate(
    util: Util,
    model: RateModel,
) {
    const rate = rate_by(
        util.value,
        model.util,
        model.rate,
    );
    const more = UNIT + model.spread;
    const bora = (rate * more) / UNIT;
    return bora;
}
function rate_by(
    util: number,
    util_optimal: number,
    rate_optimal: number,
) {
    if (util <= util_optimal && util_optimal > 0) {
        return (util * rate_optimal) / util_optimal;
    }
    const d1U = UNIT - util_optimal;
    const d1R = UNIT - rate_optimal;
    const dUR = util_optimal - rate_optimal;
    // u×(1-R) >= 1×(U-R) because 0 < u > U
    return (util * d1R - UNIT * dUR) / d1U;
}
export default RateInfo;
