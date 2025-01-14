import { Address, Amount, Symbol, Tokens, Weights } from "@/type";
import { parseUnits } from "ethers";

export type Token = {
    address: Address;
    decimals: bigint;
    supply: bigint;
    symbol: Symbol;
}
export const Token = {
    amount(token: Token, amount?: bigint): Amount {
        const lhs = Number(amount ?? 10n ** token.decimals);
        const rhs = Number(10n ** token.decimals);
        return lhs / rhs;
    },
    big: (token: Token, amount: Amount): bigint => {
        const amount_fix = amount.toFixed(Number(token.decimals));
        return parseUnits(amount_fix, token.decimals);
    },
    from: (address: Address | Symbol): Token => {
        const rx = new RegExp(`^${address}$`, "i");
        const ts = Object.values(Tokens);
        if (Address.isAddress(address)) {
            return ts.find((t) => rx.test(`${t.address}`)) ?? {
                ...Tokens[Symbol.NONE], address,
            };
        } else {
            return ts.find((t) => rx.test(t.symbol)) ?? {
                ...Tokens[Symbol.NONE],
            };
        }
    },
    unit: (token: Token | Address): Amount => {
        if (Address.isAddress(token)) {
            const { decimals } = Token.from(token);
            return Number(10n ** decimals);
        }
        const { decimals } = token;
        return Number(10n ** decimals);
    },
}
export type TokenInfo = Token & {
    weights: Weights;
}
export const TokenInfo = {
    from: (address: Address): TokenInfo => ({
        ...Token.from(address), weights: [255, 170]
    }),
}
export default Token;
