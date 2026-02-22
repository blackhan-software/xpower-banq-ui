import { Position } from "@/type";
import { useCallback, useEffect, useState } from "react";

import ChartQuotes from "./chart-quotes";
import ChartUtils from "./chart-utils";
import useQuotes from "./use-quotes";
import useUtils from "./use-utils";

type Props = {
    /** DB index to query */
    db_index: number;
    /** Source position to query */
    source: Position;
    /** Target position to query */
    target: Position;
    /** Date range to query */
    range: [lhs: Date, rhs: Date];
    /** Chart index */
    index: number;
}
export function PositionCharts(
    { index, db_index, source, target, range }: Props,
) {
    const [enabled] = useEnabled(index);
    const { data: utils = [] } = useUtils({
        db_index, position: target, range, enabled, 
    });
    const { data: quotes = [] } = useQuotes({
        db_index, source, target, range, enabled,
    });
    const [dragOffset, setDragOffset] = useState(0);
    const offset = 1 - dragOffset;
    const on_dragOffset = useCallback((delta: number) => {
        setDragOffset(old_value => old_value + delta);
    }, []);
    return <>
        <ChartQuotes
            serie={quotes} period={28} offset={offset}
            yLabel={`${source.symbol}/${target.symbol}`}
            onDragOffset={on_dragOffset}
        />
        <ChartUtils
            serie={utils} period={28} offset={offset}
            yLabel={`${target.symbol} Utilization`}
            onDragOffset={on_dragOffset}
        />
    </>;
}
function useEnabled(
    index: number
) {
    const [flag, set_flag] = useState(false);
    useEffect(() => {
        const $body = document.getElementById(
            `accordion-body-${index}`
        );
        if (!$body) return; // guard
        const $item = $body.parentElement;
        if (!$item) return; // guard
        const on_show = () => set_flag(true);
        $body.addEventListener("show.bs.collapse", on_show);
        $body.addEventListener("touchstart", on_show);
        $item.addEventListener("mouseover", on_show);
        set_flag($body.classList.contains("show"));
        return () => {
            $body.removeEventListener("show.bs.collapse", on_show);
            $body.removeEventListener("touchstart", on_show);
            $item.removeEventListener("mouseover", on_show);
        };
    }, [
        index
    ]);
    return [flag] as const;
}
export default PositionCharts;
