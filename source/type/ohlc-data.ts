export type OHLCData = {
    /** Open: first price in the period */
    o: number;
    /** High: maximum price in the period */
    h: number;
    /** Low: minimum price in the period */
    l: number;
    /** Close: last price in the period */
    c: number;
    /** Time: timestamp for the period */
    t: Date;
    /** Count: frequency of quotes (0 for synthetic) */
    n: number;
};
export const OHLCData = {
    /**
     * Interpolate missing entries with *next* known entry;
     * using a *daily* frequency.
     *
     * @param serie to iterate over
     * @param period of interpolation [ms] (default: daily)
     * @returns interpolated serie (sorted by t)
     */
    inter(
        serie: OHLCData[], period = 864e5,
    ): OHLCData[] {
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
        const items = serie.slice();
        for (
            let t = lhs.t.getTime(); t < rhs.t.getTime(); t += period
        ) {
            const dt = new Date(t);
            const entry = serie.find(({ t: my }) => {
                const dt_time = dt.getTime() - dt.getTime() % period;
                const my_time = my.getTime() - my.getTime() % period;
                return dt_time === my_time;
            });
            if (entry === undefined) {
                const index = serie.findIndex(
                    ({ t: my }) => dt.getTime() <= my.getTime()
                );
                const next = serie[index];
                if (next !== undefined) {
                    items.splice(index, 0, {
                        o: next.o,
                        h: next.h,
                        l: next.l,
                        c: next.c,
                        t: dt,
                        n: 0,
                    });
                }
            }
        }
        return items.sort(
            (lhs, rhs) => lhs.t.getTime() - rhs.t.getTime()
        );
    },
    /**
     * Extrapolate missing entries with *closest* known entry;
     * using a *daily* frequency.
     *
     * @param serie to iterate over
     * @param range to iterate over
     * @param period of extrapolation [ms] (default: daily)
     * @returns extrapolated serie (sorted by t)
     */
    extra(
        serie: OHLCData[], range: { lhs: Date; rhs: Date }, period = 864e5,
    ): OHLCData[] {
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
        const items = [] as OHLCData[];
        for (
            let t = range.lhs.getTime(); t <= range.rhs.getTime(); t += period
        ) {
            const dt = new Date(t);
            if (dt.getTime() < lhs.t.getTime()) {
                items.unshift({
                    o: lhs.o,
                    h: lhs.h,
                    l: lhs.l,
                    c: lhs.c,
                    t: dt,
                    n: 0,
                });
                continue;
            }
            if (dt.getTime() > rhs.t.getTime()) {
                items.push({
                    o: rhs.c,
                    h: rhs.c,
                    l: rhs.c,
                    c: rhs.c,
                    t: dt,
                    n: 0,
                });
                continue;
            }
            const entry = serie.find(({ t: my }) => {
                const dt_time = dt.getTime() - dt.getTime() % period;
                const my_time = my.getTime() - my.getTime() % period;
                return dt_time === my_time;
            });
            if (entry !== undefined) {
                items.push(entry);
            }
        }
        return items.sort(
            (lhs, rhs) => lhs.t.getTime() - rhs.t.getTime()
        );
    },
    /**
     * Clip entries to given t range (inclusive).
     *
     * @param serie to iterate over
     * @param range to iterate over
     * @returns clipped serie (sorted by t)
     */
    clip(
        serie: OHLCData[], range: { lhs: Date; rhs: Date },
    ): OHLCData[] {
        const items = serie.filter(({ t: my }) => (
            my.getTime() >= range.lhs.getTime() &&
            my.getTime() <= range.rhs.getTime()
        ));
        return items.sort(
            (lhs, rhs) => lhs.t.getTime() - rhs.t.getTime()
        );
    },
};
export default OHLCData;
