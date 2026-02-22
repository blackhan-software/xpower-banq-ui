import { cap as CAP, EXP_FORMAT, humanize, KMG_FORMAT, NUM_FORMAT, render } from "@/function";
import { Mode, Position } from "@/type";

import { Div, Input, Span, Strong } from "@/react/element";

export function PositionAmount({ position, mode }: {
    position: Position;
    mode: Mode;
}) {
    const amount = NUM_FORMAT(2)(
        Position.amount(position)
    );
    const title = PositionAmountTitle(
        position, mode,
    );
    return <Input
        bs-html="true"
        class={[
            "focus-ring", "focus-ring-secondary",
            "form-control", "text-end",
            "ps-1", "pe-2",
        ]}
        name="position-amount"
        readOnly
        value={amount}
        title={render(title)}
        type="text"
    />;
}
function PositionAmountTitle(
    position: Position,
    mode: Mode,
) {
    const modal = CAP(Mode.modal(mode));
    const amount = Position.amount(position);
    const amount_fmt = KMG_FORMAT(2)(amount);
    const locked = Position.locked(position);
    const locked_fmt = KMG_FORMAT(2)(locked);
    const liquid = amount - locked;
    const liquid_fmt = KMG_FORMAT(2)(liquid);
    const [cap, dt] = Position.cap(position, mode);
    const cap_fmt = cap < 1e12 ? KMG_FORMAT(2)(cap) : EXP_FORMAT(2)(cap);
    const dt_fmt = dt ? humanize(dt, true) : "—";
    return <Div style={{ textAlign: "center" }}>
        <Strong>My {modal} {position.symbol}</Strong>
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
        <Strong>My Position Cap</Strong>
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
export default PositionAmount;
