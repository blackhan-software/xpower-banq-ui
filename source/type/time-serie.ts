import { zip } from "@/function";

export type TimeSerie = Array<[
    /** Value(s) of entry */
    v: number[],
    /** Timestamp of entry */
    t: Date,
    /** Sample size of entry */
    n: number
]>;
export const TimeSerie = {
    /**
     * Interpolate missing entries with *next* known entry;
     * using a *daily* frequency.
     *
     * @param serie to iterate over
     * @param period of interpolation [ms] (default: daily)
     * @returns interpolated serie (sorted by timestamp)
     */
    inter(
        serie: TimeSerie, period = 864e5,
    ): TimeSerie {
        if (serie.length === 0) {
            return [];
        }
        const lhs = serie[0]!;
        const rhs = serie[serie.length - 1]!;
        if (lhs === undefined ||
            rhs === undefined
        ) {
            return [];
        }
        const items = serie.slice();
        for (
            let t = lhs[1].getTime(); t < rhs[1].getTime(); t += period
        ) {
            const dt = new Date(t);
            const entry = serie.find(([_, my]) => {
                const dt_time = dt.getTime() - dt.getTime() % period;
                const my_time = my.getTime() - my.getTime() % period;
                return dt_time === my_time;
            });
            if (entry === undefined) {
                const index = serie.findIndex(
                    ([_, my]) => dt.getTime() <= my.getTime()
                );
                const next = serie[index];
                if (next !== undefined) {
                    items.splice(index, 0, [next[0], dt, 0]);
                }
            }
        }
        return items.sort(
            (lhs, rhs) => lhs[1].getTime() - rhs[1].getTime()
        );
    },
    /**
     * Extrapolate missing entries with *closest* known entry;
     * using a *daily* frequency.
     *
     * @param serie to iterate over
     * @param range to iterate over
     * @param period of extrapolation [ms] (default: daily)
     * @returns extrapolated serie (sorted by timestamp)
     */
    extra(
        serie: TimeSerie, range: { lhs: Date; rhs: Date }, period = 864e5,
    ): TimeSerie {
        if (serie.length === 0) {
            return [];
        }
        const lhs = serie[0];
        const rhs = serie[serie.length - 1];
        if (lhs === undefined ||
            rhs === undefined
        ) {
            return [];
        }
        const items = [] as TimeSerie;
        for (
            let t = range.lhs.getTime(); t <= range.rhs.getTime(); t += period
        ) {
            const dt = new Date(t);
            if (dt.getTime() < lhs[1].getTime()) {
                items.unshift([lhs[0], dt, 0]);
                continue;
            }
            if (dt.getTime() > rhs[1].getTime()) {
                items.push([rhs[0], dt, 0]);
                continue;
            }
            const entry = serie.find(([_, my]) => {
                const dt_time = dt.getTime() - dt.getTime() % period;
                const my_time = my.getTime() - my.getTime() % period;
                return dt_time === my_time;
            });
            if (entry !== undefined) {
                items.push(entry);
            }
        }
        return items.sort(
            (lhs, rhs) => lhs[1].getTime() - rhs[1].getTime()
        );
    },
    /**
     * Clip entries to given stamp range (inclusive).
     *
     * @param serie to iterate over
     * @param range to iterate over
     * @returns clipped serie (sorted by timestamp)
     */
    clip(
        serie: TimeSerie, range: { lhs: Date; rhs: Date },
    ): TimeSerie {
        const items = serie.filter(([_, my]) => (
            my.getTime() >= range.lhs.getTime() &&
            my.getTime() <= range.rhs.getTime()
        ));
        return items.sort(
            (lhs, rhs) => lhs[1].getTime() - rhs[1].getTime()
        );
    },
    /**
     * Get unique entries by timestamp and weighted by sample;
     * using a *daily* frequency.
     *
     * @param serie to iterate over
     * @param period of uniqueness [ms] (default: daily)
     * @returns unique serie (sorted by timestamp)
     */
    uniq(
        serie: TimeSerie, period = 864e5,
    ): TimeSerie {
        const items = new Map<number, TimeSerie[0]>();
        for (const entry of serie) {
            const rest = entry[1].getTime() % period;
            const time = entry[1].getTime() - rest;
            const item = items.get(time);
            if (item === undefined) {
                items.set(time, [entry[0], new Date(time), entry[2]]);
                continue;
            }
            const sample = item[2] + entry[2];
            if (sample > 0) {
                const values = zip(item[0], entry[0]).map(
                    ([a, b]) => (a * item[2] + b * entry[2]) / sample
                );
                items.set(time, [values, item[1], sample]);
            } else {
                const zeros = new Array<number>(item[0].length).fill(0);
                items.set(time, [zeros, item[1], 0]);
            }
        }
        return Array.from(items.values()).sort(
            (lhs, rhs) => lhs[1].getTime() - rhs[1].getTime()
        );
    },
};
export default TimeSerie;
