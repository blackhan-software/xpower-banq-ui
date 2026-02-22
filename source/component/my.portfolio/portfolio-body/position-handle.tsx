import { buffered } from "@/function";
import { Mode, Position } from "@/type";

import { I, Pulsar, Span } from "@/react/element";
import { usePool, useWalletAccount } from "@/react/hook";
import { useState } from "react";

import { TxRunner } from "./tx-exit-runner";

export function PositionHandle({ position, mode }: {
    position: Position;
    mode: Mode;
}) {
    const [pulse, set_pulse] = useState(false);
    const [account] = useWalletAccount();
    const [pool] = usePool();
    return <Pulsar
        class={[
            "focus-ring", "focus-ring-secondary",
            "btn btn-secondary btn-handle",
            "flex-shrink-0",
            "w-50",
        ]}
        onClick={buffered(async (ev) => {
            set_pulse(true);
            try {
                await TxRunner(account, pool, mode, {
                    amount: null, position,
                    ctrl: ev.ctrlKey,
                });
            } finally {
                set_pulse(false);
            }
        })}
        title={HandleTitle(position, mode)}
        bs-placement="left"
        pulse={pulse}
        type="button"
    >
        <HandleLabel mode={mode} />
    </Pulsar>;
}
function HandleTitle(
    position: Position,
    mode: Mode,
) {
    const { symbol } = position;
    switch (mode) {
        case Mode.supply:
            return `Redeem ${symbol}`;
        case Mode.borrow:
            return `Settle ${symbol}`;
    }
}
function HandleLabel({ mode }: {
    mode: Mode;
}) {
    switch (mode) {
        case Mode.supply:
            return <LabelRedeem />;
        case Mode.borrow:
            return <LabelSettle />;
    }
}
function LabelRedeem() {
    const icon = () => {
        return <I class="bi bi-box-arrow-down" />;
    };
    return <>
        <Span class="d-none d-sm-inline text me-1">
            Redeem
        </Span>
        <Span class="d-none d-sm-inline float-end">
            {icon()}
        </Span>
        <Span class="d-inline d-sm-none">
            {icon()}
        </Span>
    </>;
}
function LabelSettle() {
    const icon = () => {
        return <I class="bi bi-box-arrow-in-up" />;
    };
    return <>
        <Span class="d-none d-sm-inline text me-1">
            Settle
        </Span>
        <Span class="d-none d-sm-inline float-end">
            {icon()}
        </Span>
        <Span class="d-inline d-sm-none">
            {icon()}
        </Span>
    </>;
}
export default PositionHandle;
