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
    from: (() => {
        let by_address: Map<string, Token> | undefined;
        let by_symbol: Map<string, Token> | undefined;
        return (address: Address | Symbol): Token => {
            if (Address.isAddress(address)) {
                if (!by_address) {
                    const ts = Object.values(Tokens);
                    by_address = new Map(ts.map(
                        (t) => [t.address.toLowerCase(), t] as const,
                    ));
                }
                return by_address.get(address.toLowerCase())
                    ?? { ...Tokens[Symbol.NONE], address };
            } else {
                if (!by_symbol) {
                    const ts = Object.values(Tokens);
                    by_symbol = new Map(ts.map(
                        (t) => [t.symbol.toLowerCase(), t] as const,
                    ));
                }
                return by_symbol.get(
                    (address as string).toLowerCase(),
                ) ?? { ...Tokens[Symbol.NONE] };
            }
        };
    })(),
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
        ...Token.from(address), weights: [255, 85]
    }),
}
export default Token;
