import { UNIT } from "@/constant";
import { cap as CAP, EXP_FORMAT, humanize, KMG_FORMAT, NUM_FORMAT, render } from "@/function";
import { SVG } from "@/image";
import { Mode, Position, RateInfo, Symbol, Util } from "@/type";

import { Div, P, Span, Strong } from "@/react/element";

import { IconSector } from "./icon-sector";

export function PositionLabel({ position, rate, mode }: {
    position: Position;
    rate: RateInfo;
    mode: Mode;
}) {
    const icon_title = PositionIconTitle(position, rate);
    const text_title = PositionLabelTitle(position, mode)
    const { symbol } = position;
    return <Div class={[
        "d-none d-sm-block",
        "text-center px-2",
    ]}>
        <Div class={[
            "d-flex align-items-center gap-1",
        ]}>
            <Span
                style={{ position: "relative" }}
                title={render(icon_title)} bs-html="true"
            >
                <SVG icon={symbol} height={16} width={16} />
                <IconSector position={position} rate={rate} />
            </Span>
            <Span
                class="text"
                title={render(text_title)} bs-html="true"
            >
                {text_of(symbol)}
            </Span>
        </Div>
    </Div>;
    function text_of(symbol: Symbol) {
        if (symbol !== Symbol.NONE) {
            return <Span>{symbol}</Span>;
        }
        return <P class="placeholder-glow">
            <Span class="placeholder py-2 pe-5"></Span>
        </P>;
    }
}
function PositionIconTitle(
    position: Position,
    rate: RateInfo,
) {
    const percent = ({ value: percentage }: Util) => {
        return NUM_FORMAT(2)(100 * percentage / UNIT) + '%';
    };
    return <Div style={{ textAlign: "left" }}>
        <Strong>{position.symbol} Utilization</Strong>
        <Div class="d-flex justify-content-between small mt-1">
            <Span>󠀥🌊&nbsp;Current:&nbsp;</Span>
            <Span>{percent(rate.util)}</Span>
        </Div>
    </Div>;
}
export function PositionLabelTitle(
    position: Position,
    mode: Mode,
) {
    const { symbol } = position;
    const modal = CAP(Mode.modal(mode));
    const amount = Position.supply(position);
    const amount_fmt = KMG_FORMAT(2)(amount);
    const locked = Position.lockedTotal(position);
    const locked_fmt = KMG_FORMAT(2)(locked);
    const liquid = amount - locked;
    const liquid_fmt = KMG_FORMAT(2)(liquid);
    const [cap, dt] = Position.capTotal(position, mode);
    const cap_fmt = cap < 1e12 ? KMG_FORMAT(2)(cap) : EXP_FORMAT(2)(cap);
    const dt_fmt = dt ? humanize(dt, true) : "—";
    return <Div style={{ textAlign: "left" }}>
        <Strong>All {modal} {symbol}</Strong>
        <Div class="d-flex justify-content-between small mt-1">
            <Span>#️⃣&nbsp;Amount:&nbsp;</Span>
            <Span>{amount_fmt}</Span>
        </Div>
        <Div class="d-flex justify-content-between small">
            <Span>🔒&nbsp;Locked:&nbsp;</Span>
            <Span>{locked_fmt}</Span>
        </Div>
        <Div class="d-flex justify-content-between small mb-1">
            <Span>💦&nbsp;Liquid:&nbsp;</Span>
            <Span>{liquid_fmt}</Span>
        </Div>
        <Strong>Total Position Cap</Strong>
        <Div class="d-flex justify-content-between small mt-1">
            <Span>🛑&nbsp;Max:&nbsp;</Span>
            <Span>{cap_fmt.replace(/e\+/, "E+")}</Span>
        </Div>
        <Div class="d-flex justify-content-between small">
            <Span>{dt ? "⏳" : "⌛"}&nbsp;Till:&nbsp;</Span>
            <Span>{dt_fmt}</Span>
        </Div>
    </Div>;
}
