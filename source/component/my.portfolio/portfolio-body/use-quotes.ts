import { CONTRACT_RUN, ENDPOINT_URL } from "@/constant";
import { Calculator, queryKey, v } from "@/function";

import { OHLCData, Position } from "@/type";
import { useQuery } from "@tanstack/react-query";

type Props = {
    /** DB index to query */
    db_index: number;
    /** Source position to query */
    source: Position;
    /** Target position to query */
    target: Position;
    /** Date range to query */
    range: [lhs: Date, rhs: Date];
    /** Whether to query */
    enabled?: boolean;
}
type OHLCRow = [
    open: number, high: number, low: number, close: number, day: string, n: number
];
export function useQuotes(
    props: Props,
) {
    return useQuery({
        enabled: props.enabled ?? true,
        queryKey: [
            queryKey(api({ ...props })),
            queryKey(api({ ...props })),
            "price-quotes-ohlc",
        ],
        /**
         * @returns responses from the lhs (bid/ask) & rhs (ask/bid) endpoints
         */
        queryFn: async () => {
            const [lhs_xhr, rhs_xhr] = await Promise.all([
                fetch(api({ ...props, source: props.source, target: props.target })).catch(() => null),
                fetch(api({ ...props, source: props.target, target: props.source })).catch(() => null),
            ]);
            const [lhs_rows, rhs_rows] = await Promise.all([
                lhs_xhr?.ok ? lhs_xhr.json().catch(() => []) : [],
                rhs_xhr?.ok ? rhs_xhr.json().catch(() => []) : [],
            ]);
            return [
                { rows: lhs_rows?.map((row: Record<string, unknown>) => Object.values(row)) ?? [] },
                { rows: rhs_rows?.map((row: Record<string, unknown>) => Object.values(row)) ?? [] },
            ] as const;
        },
        /**
         * @returns OHLC data from merged lhs/rhs daily aggregates
         */
        select: ([{ rows: lhs_rows }, { rows: rhs_rows }]): OHLCData[] => {
            if (lhs_rows?.length || rhs_rows?.length) {
                // Create maps for both sides with OHLC data
                const lhs_map = new Map<string, OHLCData>(
                    lhs_rows.map(([o, h, l, c, d, n]: OHLCRow) => [d, {
                        o: to_price(o),
                        h: to_price(h),
                        l: to_price(l),
                        c: to_price(c),
                        t: new Date(d), n
                    }])
                );
                const rhs_map = new Map<string, OHLCData>(
                    rhs_rows.map(([o, h, l, c, d, n]: OHLCRow) => [d, {
                        o: 1 / to_price(o),
                        h: 1 / to_price(l),
                        l: 1 / to_price(h),
                        c: 1 / to_price(c),
                        t: new Date(d), n
                    }])
                );
                // Get all unique days
                const days = new Set<string>([
                    ...lhs_rows.map(([_, __, ___, ____, d]: OHLCRow) => d),
                    ...rhs_rows.map(([_, __, ___, ____, d]: OHLCRow) => d),
                ]);
                // Merge OHLC data for each day
                const ohlc_data: OHLCData[] = Array.from(days).map((day): OHLCData => {
                    const [lhs_ohlc, rhs_ohlc] = [lhs_map.get(day), rhs_map.get(day)];
                    if (lhs_ohlc !== undefined && rhs_ohlc !== undefined) {
                        // Both sides exist: weighted average for o/c, max/min for h/l
                        const total_n = lhs_ohlc.n + rhs_ohlc.n;
                        return {
                            o: (lhs_ohlc.o * lhs_ohlc.n + rhs_ohlc.o * rhs_ohlc.n) / total_n,
                            h: Math.max(lhs_ohlc.h, rhs_ohlc.h),
                            l: Math.min(lhs_ohlc.l, rhs_ohlc.l),
                            c: (lhs_ohlc.c * lhs_ohlc.n + rhs_ohlc.c * rhs_ohlc.n) / total_n,
                            t: new Date(day),
                            n: total_n,
                        };
                    }
                    if (lhs_ohlc !== undefined) {
                        return lhs_ohlc;
                    }
                    if (rhs_ohlc !== undefined) {
                        return rhs_ohlc;
                    }
                    return { o: 0, h: 0, l: 0, c: 0, t: new Date(day), n: 0 };
                });
                return ohlc_data.sort(
                    (lhs, rhs) => lhs.t.getTime() - rhs.t.getTime()
                );
            }
            return [];
        },
        staleTime: 864e5, // 24 hours
        retry: 1, // once
    });
}
function api(
    props: Props,
    base_url = ENDPOINT_URL,
) {
    return `${base_url}/${db_name(props)}/${daily_ohlc(props.range)}`;
}
function db_name(
    { db_index, target, source }: Props,
) {
    return `rt_${target.symbol}_${source.symbol}_${db_index}`.toLowerCase();
}
function daily_ohlc(
    range: Props["range"],
) {
    const lhs = range[0].toISOString().substring(0, 10);
    const rhs = range[1].toISOString().substring(0, 10);
    return `daily_ohlc.json?lhs=${lhs}&rhs=${rhs}`;
}
function to_price(value: number): number {
    return v(CONTRACT_RUN) > v("10a") ? Calculator.Exp2(value) : value;
}
export default useQuotes;
