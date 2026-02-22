import { Sector } from "@/component";
import { CONTRACT_RUN } from "@/constant";
import { buffered, cap, NUM_FORMAT, render, v } from "@/function";
import { Mode, Position } from "@/type";

import { Div, Pulsar, Span, Strong } from "@/react/element";
import { usePool, useWalletAccount } from "@/react/hook";
import { useState } from "react";

import { TxLockRunner } from "./tx-lock-runner";

export function PositionLock({ position, mode }: {
    position: Position;
    mode: Mode;
}) {
    const lock_title = LockTitle(position, mode);
    const [pulse, set_pulse] = useState(false);
    const [account] = useWalletAccount();
    const [pool] = usePool();
    return <Div class={[
        "position-lock", "text-center", "pe-3",
    ]}>
        <Pulsar
            class={[
                "btn btn-lock",
                "p-0 border-0",
            ]}
            onClick={buffered(async () => {
                set_pulse(true);
                try {
                    await TxLockRunner(account, pool, mode, {
                        position,
                    });
                } finally {
                    set_pulse(false);
                }
            })}
            disabled={disabled(position)}
            bs-placement="left"
            pulse={pulse} n={1}
            type="button"
        >
            <Span class="text" title={render(lock_title)} bs-html="true">
                <LockIcon position={position} />
            </Span>
        </Pulsar>
    </Div>;
}
function disabled(position: Position) {
    if (v(CONTRACT_RUN) <= v("10a")) {
        return true; // unsupported
    }
    if (!Position.amount(position)) {
        return true; // empty
    }
    return false;
}
function LockTitle(
    position: Position, mode: Mode,
) {
    const share = Position.lockedShare(position);
    const percent = (percentage: number) => {
        return NUM_FORMAT(2)(100 * percentage) + '%';
    };
    return <Div style={{ textAlign: "left" }}>
        <Strong>My Locked {cap(mode)}</Strong>
        <Div class="d-flex justify-content-between small mt-1">
            <Span>🔒&nbsp;Current:&nbsp;</Span>
            <Span>{percent(share)}</Span>
        </Div>
    </Div>;
}
function LockIcon({ position }: {
    position: Position;
}) {
    const length = 360 * Position.lockedShare(position);
    const offset = 180 - length / 2;
    return <Span
        style={{ position: "relative" }}
    >
        <Span class="lock-icon">🔒</Span>
        <Sector
            length={length} radius={10} start={offset}
            stroke={{ color: "#6c757d", width: 2 }}
            style={{ top: `calc(50% + 0.5px)` }}
        />
    </Span>;
}
export default PositionLock;
