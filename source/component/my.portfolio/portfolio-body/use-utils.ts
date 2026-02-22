import { ENDPOINT_URL } from "@/constant";
import { queryKey, zip } from "@/function";
import { Mode, Position, TimeSerie as TS } from "@/type";

import { useQuery } from "@tanstack/react-query";

type Props = {
    /** DB index to query */
    db_index: number;
    /** Position to query */
    position: Position;
    /** Date range to query */
    range: [lhs: Date, rhs: Date];
    /** Whether to query */
    enabled?: boolean;
}
type V1DN = [
    value: number, date: string, n: number
];
export function useUtils(
    props: Props,
) {
    return useQuery({
        enabled: props.enabled ?? true,
        queryKey: [
            queryKey(api({ ...props, mode: Mode.supply })),
            queryKey(api({ ...props, mode: Mode.borrow })),
            "utilization-rates",
        ],
        /**
         * @returns responses from the supply & borrow endpoints
         */
        queryFn: async () => {
            const [su_xhr, bo_xhr] = await Promise.all([
                fetch(api({ ...props, mode: Mode.supply })).catch(() => null),
                fetch(api({ ...props, mode: Mode.borrow })).catch(() => null),
            ]);
            if (su_xhr?.ok && bo_xhr?.ok) {
                const [su_rows, bo_rows] = await Promise.all([
                    su_xhr.json(),
                    bo_xhr.json(),
                ]);
                return [
                    { rows: su_rows?.map((row: Record<string, unknown>) => Object.values(row)) ?? [] },
                    { rows: bo_rows?.map((row: Record<string, unknown>) => Object.values(row)) ?? [] },
                ] as const;
            }
            return [{ rows: [] }, { rows: [] }] as const;
        },
        /**
         * @returns merged supply & borrow utilization rates
         */
        select: ([{ rows: su_rows }, { rows: bo_rows }]): TS => {
            if (su_rows?.length || bo_rows?.length) {
                const su_map = new Map<string, TS[0]>(
                    su_rows.map(([v, d, n]: V1DN) => [d, [[v], new Date(d), n] as TS[0]])
                );
                const bo_map = new Map<string, TS[0]>(
                    bo_rows.map(([v, d, n]: V1DN) => [d, [[v], new Date(d), n] as TS[0]])
                );
                const days = new Set<string>([
                    ...su_rows.map(([_, d]: [number, string]) => d),
                    ...bo_rows.map(([_, d]: [number, string]) => d),
                ]);
                const serie: TS = Array.from(days).map((day): TS[0] => {
                    const [sura, bora] = [su_map.get(day), bo_map.get(day)];
                    if (sura !== undefined && bora !== undefined) {
                        const total = sura[2] + bora[2];
                        if (total === 0) {
                            return [[0], new Date(day), 0];
                        }
                        const lhs = sura[0].map(v => sura[2] * v);
                        const rhs = bora[0].map(v => bora[2] * v);
                        const sum = zip(lhs, rhs).map(([a, b]) => a + b);
                        const avg = sum.map(v => v / total);
                        return [avg, sura[1], total];
                    }
                    if (sura !== undefined) {
                        return sura;
                    }
                    if (bora !== undefined) {
                        return bora;
                    }
                    return [[0], new Date(day), 0];
                });
                return serie.sort(
                    (lhs, rhs) => lhs[1].getTime() - rhs[1].getTime()
                );
            }
            return [];
        },
        staleTime: 864e5, // 24 hours
        retry: 1, // once
    });
}
function api(
    props: Props & { mode: Mode },
    base_url = ENDPOINT_URL,
) {
    return `${base_url}/${db_name(props)}/${daily_average(props.range)}`;
}
function db_name(
    { db_index, position, mode }: Props & { mode: Mode },
) {
    return `ri_${position.symbol}_${mode}_${db_index}`.toLowerCase();
}
function daily_average(
    range: Props["range"],
) {
    const lhs = range[0].toISOString().substring(0, 10);
    const rhs = range[1].toISOString().substring(0, 10);
    return `daily_average.json?lhs=${lhs}&rhs=${rhs}`;
}
export default useUtils;
