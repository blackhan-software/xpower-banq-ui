import { OracleContract } from "@/contract";
import { assert } from "@/function";
import { useOracleContract, usePoolContract, usePoolTokens } from "@/react/hook";
import { Address, Pool, PoolToken, Quote, Token } from "@/type";
import { appStore } from "@/zustand";
import { useQuery } from "@tanstack/react-query";

export function useOracleQuote() {
    let { pool, oracle_quote, set_oracle_quote } = appStore();
    if (oracle_quote instanceof Array) {
        oracle_quote = new Map(oracle_quote);
    }
    const [pool_contract] = usePoolContract();
    const [oracle] = useOracleContract();
    const [tokens] = usePoolTokens(
        pool_contract?.target
    );
    useQuery({
        queryKey: [
            "oracle-quotes",
            oracle?.target,
            ...tokens ?? [],
            pool,
        ],
        queryFn: async () => {
            assert(oracle, "missing oracle");
            assert(tokens, "missing tokens");
            const new_map = new Map(oracle_quote);
            const quotes = await quotes_of(
                oracle, tokens, pool,
            );
            quotes.forEach(([pt, q]) => {
                new_map.set(pt, q);
            });
            set_oracle_quote(new_map)
            return new_map;
        },
        enabled: Boolean(
            oracle?.target &&
            tokens?.length
        ),
    });
    return [oracle_quote, set_oracle_quote] as const;
}
async function quotes_of(
    oracle: OracleContract,
    tokens: Address[],
    pool: Pool,
): Promise<[PoolToken, Quote][]> {
    const quotes = [] as [PoolToken, Quote][];
    const tgt_address = tokens[0];
    assert(tgt_address, "missing token");
    for (const src_address of tokens) {
        const unit = BigInt(Token.unit(src_address));
        const quote = await oracle.getQuotes(
            unit, src_address, tgt_address,
        );
        const pt = PoolToken.from(pool, src_address);
        quotes.push([pt, Quote.from([unit, ...quote])]);
    }
    return quotes;
}
export default useOracleQuote;
