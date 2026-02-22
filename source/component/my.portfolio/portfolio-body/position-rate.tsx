import { magentaDark } from "@/app-theme";
import { UNIT } from "@/constant";
import { cap as CAP, NUM_FORMAT, render } from "@/function";
import { SVG } from "@/image";
import { LockParams, Mode, Position, RateInfo, RateModel } from "@/type";

import { Div, Input, Span, Strong } from "@/react/element";
import { useEffect, useMemo, useState } from "react";

export function PositionRate({ position, lock_params, model, rate, mode }: {
    position: Position;
    lock_params: LockParams;
    model: RateModel;
    rate: RateInfo;
    mode: Mode;
}) {
    const lock_ratio = position.amount > 0n
        ? Number(position.locked) / Number(position.amount) : 0;
    const percent = (usb: RateInfo) => {
        if (usb && mode === Mode.supply) {
            const base = 100 * usb.sura / UNIT;
            return base * (1 + lock_ratio * lock_params.bonus / UNIT);
        }
        if (usb && mode === Mode.borrow) {
            const base = 100 * usb.bora / UNIT;
            return base * (1 - lock_ratio * lock_params.malus / UNIT);
        }
        return 0;
    };
    const apy = NUM_FORMAT(2)(percent(rate));
    const title = PositionRateTitle(position, lock_params, model, rate, mode);
    return <>
        <Input
            bs-html="true"
            class={[
                "focus-ring", "focus-ring-secondary",
                "d-block d-sm-none",
                "form-control",
                "text-center",
                "px-0",
            ]}
            name="position-rate"
            readOnly
            value={`${apy}%`}
            title={render(title)}
            type="text"
        />
        <Input
            bs-html="true"
            class={[
                "focus-ring", "focus-ring-secondary",
                "d-none d-sm-block",
                "form-control",
                "text-center",
                "px-0",
            ]}
            name="position-rate"
            readOnly
            value={`${apy}% APY`}
            title={render(title)}
            type="text"
        />
    </>;
}
function PositionRateTitle(
    position: Position,
    lock_params: LockParams,
    irm: RateModel,
    rate: RateInfo,
    mode: Mode,
) {
    const percent = (value: number) => {
        return NUM_FORMAT(1)(100 * value / UNIT) + '%';
    };
    const lock_ratio = position.amount > 0n
        ? Number(position.locked) / Number(position.amount)
        : 0;
    const lock_modus = mode === Mode.supply
        ? 'Bonus' : 'Malus';
    const lock_delta = mode === Mode.supply
        ? lock_ratio * lock_params.bonus / UNIT
        : lock_ratio * lock_params.malus / UNIT;
    const pm_sign = mode === Mode.supply ? '+' : '-';
    const mp_sign = mode === Mode.supply ? '-' : '+';
    return <Div style={{ textAlign: "left" }}>
        <Strong>{position.symbol} {CAP(mode)} Rate</Strong>
        <Div class="d-flex mb-1">
            {PositionRateTitleSVG(irm, mode, rate)}
        </Div>
        <Div class="d-flex justify-content-between small">
            <Span>󠀥🌊&nbsp;Opt. Utilization:&nbsp;</Span>
            <Span>{percent(irm.util)}</Span>
        </Div>
        <Div class="d-flex justify-content-between small">
            <Span>󠀥📐&nbsp;Optimal Rate:&nbsp;</Span>
            <Span>{percent(irm.rate)}</Span>
        </Div>
        <Div class="d-flex justify-content-between small mb-1">
            <Span>󠀥↕️&nbsp;Rel. Spread:&nbsp;</Span>
            <Span>{mp_sign}{percent(irm.spread)}</Span>
        </Div>
        <Strong>My {CAP(mode)} Rate</Strong>
        <Div class="d-flex justify-content-between small mt-1">
            <Span>🔒&nbsp;Rel. Lock {lock_modus}:&nbsp;</Span>
            <Span>{pm_sign}{NUM_FORMAT(1)(100 * lock_delta)}%</Span>
        </Div>
    </Div>;
}
function PositionRateTitleSVG(
    irm: RateModel, mode: Mode, rate: RateInfo,
) {
    // SVG plot area bounds (from matplotlib generated IRM charts)
    const xMin = 10.7, xMax = 446.4, yMin = 7.2, yMax = 327.7;
    // Background IRM image path (e.g. IRM-9010.svg)
    const util_pct = Math.round(100 * irm.util / UNIT);
    const rate_pct = Math.round(100 * irm.rate / UNIT);
    const util_pad = String(util_pct).padStart(2, '0');
    const rate_pad = String(rate_pct).padStart(2, '0');
    const img_path = `image/irm/IRM-${util_pad}${rate_pad}.svg`;
    // Current rate (normalized to [0, 1])
    const mode_rate = mode === Mode.supply ? rate.sura : rate.bora;
    const util_norm = rate.util.value / UNIT;
    const rate_norm = mode_rate / UNIT;
    // SVG circle element at (x, y)
    const x = xMin + util_norm * (xMax - xMin);
    const y = yMax - rate_norm * (yMax - yMin);
    const circle = useMemo(() => `<circle
        stroke="black" stroke-width="4"
        cx="${x}" cy="${y}" r="10"
        fill="${magentaDark()}"
    />`, [x, y]);
    const [url, set_url] = useState(img_path);
    useEffect(() => {
        const cached = SVG_CACHE.get(img_path);
        if (cached) {
            const circle_svg = cached.replace('</svg>', `${circle}</svg>`);
            set_url(`data:image/svg+xml;base64,${btoa(circle_svg)}`);
            return;
        }
        fetch(img_path)
            .then(xhr => xhr.text())
            .then(svg => {
                SVG_CACHE.set(img_path, svg);
                const circle_svg = svg.replace('</svg>', `${circle}</svg>`);
                set_url(`data:image/svg+xml;base64,${btoa(circle_svg)}`);
            })
            .catch(() => set_url("image/irm/IRM-9010.svg"));
    }, [
        img_path, circle
    ]);
    return <SVG path={url} height={120} width={161} />;
}
// Cache for fetched SVG contents (less requests)
const SVG_CACHE = new Map<string, string>();
export default PositionRate;
