import { APOW_ADDRESS, AVAX_ADDRESS, NULL_ADDRESS, USDC_ADDRESS, USDT_ADDRESS, XPOW_ADDRESS } from "@/constant";
import { addressOf as x } from "@/function";
import { Symbol, Token } from "@/type";

export const Tokens: Record<Symbol, Token> = {
    [Symbol.APOW]: {
        address: x(APOW_ADDRESS),
        symbol: Symbol.APOW,
        decimals: 18n,
        supply: 0n,
    },
    [Symbol.XPOW]: {
        address: x(XPOW_ADDRESS),
        symbol: Symbol.XPOW,
        decimals: 18n,
        supply: 0n,
    },
    [Symbol.AVAX]: {
        address: x(AVAX_ADDRESS),
        symbol: Symbol.AVAX,
        decimals: 18n,
        supply: 0n,
    },
    [Symbol.USDC]: {
        address: x(USDC_ADDRESS),
        symbol: Symbol.USDC,
        decimals: 6n,
        supply: 0n,
    },
    [Symbol.USDT]: {
        address: x(USDT_ADDRESS),
        symbol: Symbol.USDT,
        decimals: 6n,
        supply: 0n,
    },
    [Symbol.NONE]: {
        address: x(NULL_ADDRESS),
        symbol: Symbol.NONE,
        decimals: 0n,
        supply: 0n,
    },
}
export default Tokens;
