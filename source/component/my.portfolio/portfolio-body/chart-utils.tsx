/* eslint @typescript-eslint/no-explicit-any: [off] */

import { gray75, grayDark, magentaDark } from "@/app-theme";
import { nice, nice_si } from "@/function";
import { Canvas, Div } from "@/react/element";
import { useMouseDragX } from "@/react/hook";
import { Scale, TimeSerie } from "@/type";
import React, { useEffect, useRef } from "react";

import Chart from "chart.js/auto";
import "./chart.scss";

type Props = {
    /** Serie to plot over */
    serie: TimeSerie,
    /** Period to plot over [day] */
    period: number,
    /** Offset to plot with [day] */
    offset: number,
    /** Callback for drag offset delta changes [day] */
    onDragOffset?: (delta: number) => void,
    /** Pixels per day (default: 10) */
    ppd?: number,
    /** Scale of y-axis (default: linear) */
    yScale?: Scale,
    /** Label for y-axis (default: "Utilization") */
    yLabel?: string,
}
export function ChartUtils(
    { serie, period, offset, onDragOffset, ppd, yScale, yLabel }: Props
) {
    if (ppd === undefined) {
        ppd = 10; // px ~ 1 day
    }
    if (yScale === undefined) {
        yScale = Scale.linear;
    }
    if (yLabel === undefined) {
        yLabel = "Utilization";
    }
    const $ref = useRef<HTMLCanvasElement>(null);
    const [drag_px] = useMouseDragX(
        $ref as React.RefObject<HTMLCanvasElement>
    );
    const drag_days_new = Math.round(drag_px / ppd);
    const drag_days_old = useRef(0);
    useEffect(() => {
        const delta = drag_days_new - drag_days_old.current;
        if (delta !== 0) {
            drag_days_old.current = drag_days_new;
            onDragOffset?.(delta);
        }
    }, [
        drag_days_new, onDragOffset
    ]);
    useEffect(() => chart($ref, {
        serie, period, offset, yScale, yLabel,
    }), [
        serie, period, offset, yScale, yLabel,
    ]);
    return <Div class="chart chart-utils">
        <Canvas ref={$ref} />
    </Div>;
}
type ChartProps = {
    serie: TimeSerie,
    period: number,
    offset: number,
    yScale: Scale,
    yLabel: string,
}
function chart(
    $ref: React.RefObject<HTMLCanvasElement | null>,
    { serie, period, offset, yScale, yLabel }: ChartProps,
) {
    if ($ref.current === null) {
        return;
    }
    const range = {
        lhs: new Date(Date.now() - (offset + period) * 86_400_000),
        rhs: new Date(Date.now() - offset * 86_400_000),
    };
    const series_filtered = TimeSerie.uniq(TimeSerie.clip(
        TimeSerie.extra(TimeSerie.inter(serie), range), range
    ));
    const stamps = series_filtered.map(([_, s]) => s);
    const values = series_filtered.map(([vs]) => vs);
    const data = {
        datasets: [{
            backgroundColor: magentaDark(0.125),
            borderColor: magentaDark(),
            borderWidth: 1,
            data: values.map(v => v[0]),
            fill: true,
            label: yLabel,
            pointBackgroundColor: magentaDark(),
            pointRadius: 1,
            stepped: true,
        }],
        labels: stamps,
    };
    const options = {
        animation: {
            duration: 0,
        },
        layout: {
            padding: {
                left: 0,
                right: 15,
            }
        },
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                bodyFont: {
                    family: "monospace",
                },
                callbacks: {
                    label: (ctx: any) => {
                        const y = ctx.parsed.y ? 100 * ctx.parsed.y : 0;
                        const label = ctx.dataset.label || "";
                        const value = nice(y, {
                            maxPrecision: 2,
                            minPrecision: 2,
                        });
                        return `${label}: ${value}%`;
                    },
                },
                displayColors: false,
            }
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
                time: {
                    unit: "day" as const,
                    displayFormats: {
                        day: "d. MMM",
                    },
                    tooltipFormat: "🗓️ dd. MMMM ''yy",
                },
                ticks: {
                    maxRotation: 0,
                    display: true,
                },
                type: "time" as const,
            },
            y: {
                grid: {
                    color: gray75(),
                    lineWidth: 0.125,
                    tickBorderDash: [1],
                },
                ticks: {
                    callback: (
                        v: string | number, _index: number, ticks: any[],
                    ) => {
                        const n = Number(v);
                        const options = {
                            maxPrecision: 1,
                            minPrecision: 1,
                        };
                        const max_tick = Math.max(
                            ...ticks.map(t => Math.abs(t.value))
                        );
                        if (max_tick >= 0.01) {
                            const n_large = nice(n * 100, options);
                            return (n_large + "%").padStart(7);
                        } else {
                            const n_small = nice_si(n, options);
                            return (n_small).padStart(6);
                        }
                    },
                    font: {
                        family: "monospace",
                    },
                    padding: 5,
                },
                title: {
                    display: true,
                    text: yLabel,
                },
                type: yScale,
            },
        },
        maintainAspectRatio: false,
    };
    Chart.defaults.font.size = 10;
    Chart.defaults.color = grayDark(1, true);
    const chart = new Chart($ref.current, {
        type: "line", data, options,
    });
    return () => chart.destroy();
}
export default ChartUtils;
