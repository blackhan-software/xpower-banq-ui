import Decimal from 'decimal.js';
import { Amount } from '.';

export type Quote = {
    bid: Amount;
    ask: Amount;
    mid: Amount;
}
export const Quote = {
    from([one, bid, ask]: [bigint, bigint, bigint]): Quote {
        const one_dec = new Decimal(one.toString());
        const bid_dec = new Decimal(bid.toString());
        const ask_dec = new Decimal(ask.toString());
        const mid_dec = bid_dec.add(ask_dec).div(2);
        return {
            bid: bid_dec.div(one_dec).toNumber(),
            ask: ask_dec.div(one_dec).toNumber(),
            mid: mid_dec.div(one_dec).toNumber(),
        };
    }
}
export default Quote;
