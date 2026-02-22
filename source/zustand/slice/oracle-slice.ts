import { Quote } from "@/type";
import { PoolToken } from "@/type/pool-token";
import { SliceCreator } from "../app-store";

export interface OracleSlice {
    set_oracle_quote: (map: Map<PoolToken, Quote> | null) => void;
    oracle_quote: Map<PoolToken, Quote> | null;
}
export const createOracleSlice: SliceCreator<OracleSlice> = (set) => ({
    set_oracle_quote: (m) => set({ oracle_quote: m }, {
        type: "ORACLE_QUOTE", quote: m
    }),
    oracle_quote: null,
});
