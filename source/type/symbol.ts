// deno-lint-ignore-file no-namespace
export enum Symbol {
    APOW = "APOW",
    XPOW = "XPOW",
    AVAX = "WAVAX",
    USDC = "USDC",
    USDT = "USDt",
    /* fallback */
    NONE = "NONE",
}
export namespace Symbol {
    /**
     * @returns A symbol from a string, even if it's not a symbol!
     */
    export function cast(symbol: string): Symbol {
        // if (symbol.match(/wavax$/i)) {
        //     symbol = Symbol.AVAX;
        // }
        return symbol as Symbol;
    }
}
export default Symbol;
