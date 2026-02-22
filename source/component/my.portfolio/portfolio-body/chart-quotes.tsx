/* eslint @typescript-eslint/no-explicit-any: [off] */

import { gray75, grayDark, lime, magentaDark, red } from "@/app-theme";
import { nice_si } from "@/function";
import { Canvas, Div } from "@/react/element";
import { useMouseDragX } from "@/react/hook";
import { OHLCData, Scale } from "@/type";
import React, { useEffect, useRef } from "react";

import Chart from "chart.js/auto";
import "chartjs-adapter-date-fns";
import { CandlestickController, CandlestickElement } from "chartjs-chart-financial";
import "./chart.scss";

// Register the financial chart components
Chart.register(CandlestickController, CandlestickElement);

type Props = {
    /** OHLC data to plot */
    serie: OHLCData[],
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
    /** Label for y-axis (default: "Quote") */
    yLabel?: string,
}
export function ChartQuotes(
    { serie, period, offset, onDragOffset, ppd, yScale, yLabel }: Props
) {
    if (ppd === undefined) {
        ppd = 10; // px ~ 1 day
    }
    if (yScale === undefined) {
        yScale = Scale.linear;
    }
    if (yLabel === undefined) {
        yLabel = "Quote";
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
    return <Div class="chart chart-quotes">
        <Canvas ref={$ref} />
    </Div>;
}
type ChartProps = {
    serie: OHLCData[],
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
    const series_filtered = OHLCData.clip(
        OHLCData.extra(OHLCData.inter(serie), range), range
    );
    // Map 't' to 'x' for Chart.js financial chart compatibility (omit 'n')
    const series_mapped = series_filtered.map(({ o, h, l, c, t }) => ({
        x: t, o, h, l, c
    }));
    const data = {
        datasets: [{
            data: series_mapped,
            backgroundColors: {
                up: lime(0.125),
                down: red(0.125),
                unchanged: grayDark(),
            },
            borderColors: {
                up: magentaDark(),
                down: magentaDark(),
                unchanged: magentaDark(),
            },
            label: yLabel,
            borderWidth: 1,
            barPercentage: 1 / period,
        }],
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
                        const datapoint = ctx.raw as OHLCData;
                        const options = {
                            maxPrecision: 3, minPrecision: 3
                        };
                        const o = nice_si(datapoint.o, options);
                        const h = nice_si(datapoint.h, options);
                        const l = nice_si(datapoint.l, options);
                        const c = nice_si(datapoint.c, options);
                        return [
                            `O: ${o}  C: ${c}`,
                            `H: ${h}  L: ${l}`,
                        ];
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
                    display: false,
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
                    callback: (v: string | number) => {
                        return nice_si(Number(v), {
                            maxPrecision: 1,
                            minPrecision: 1,
                        }).padStart(7);
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
        type: "candlestick", data, options,
    });
    return () => chart.destroy();
}
export default ChartQuotes;
