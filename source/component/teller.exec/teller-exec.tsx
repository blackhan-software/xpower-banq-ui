import { Status } from "@/blockchain";
import { IconButton } from "@/component/lib.button";
import { buffered, cap } from "@/function";
import { Div, Pulsar, Span } from "@/react/element";
import { usePool, useTellerAmount, useTellerFlag, useTellerMode, useTellerToken, useTimeout, useWalletAccount, useWalletConnect } from "@/react/hook";
import { Mode, Token } from "@/type";
import { RWParams } from "@/url";
import { useEffect, useMemo, useRef, useState } from "react";
import { TxRunner } from "./tx-runner";

export function TellerExec() {
    const [pool] = usePool();
    const [mode] = useTellerMode();
    const [token] = useTellerToken();
    const [amount] = useTellerAmount(mode);
    const [pulse, set_pulse] = useState(true);
    const [status, connect] = useWalletConnect();
    useEffect(() => set_pulse(!status), [status]);
    useTimeout(() => set_pulse(false), 2000);
    const [account] = useWalletAccount();
    const ac = useRef<AbortController | null>(null);
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") ac.current?.abort();
        };
        addEventListener("keydown", onKey);
        return () => {
            removeEventListener("keydown", onKey);
        };
    }, []);
    const onClick = useMemo(() => buffered(async (ev: React.MouseEvent) => {
        if (status !== Status.Ready) {
            return connect();
        }
        ac.current = new AbortController();
        set_pulse(Boolean(amount));
        try {
            await TxRunner(account, pool, mode, {
                signal: ac.current.signal,
                amount: amount, token,
                ctrl: ev.ctrlKey,
            });
        } finally {
            ac.current = null;
            set_pulse(false);
        }
    }), [status, connect, amount, account, pool, mode, token]);
    return <Div
        class="btn-group" role="group"
    >
        <ExecToggle />
        <Pulsar
            class={[
                "focus-ring", "focus-ring-primary",
                "btn", "btn-primary", "btn-lg",
            ]}
            onClick={onClick}
            pulse={pulse}
            type="button"
        >
            <ExecLabel
                mode={mode}
                token={token}
                status={status}
            />
        </Pulsar>
        <ExecInfo
            mode={mode}
            token={token}
        />
    </Div>;
}
function ExecLabel({
    status, token, mode,
}: {
    status: Status | null;
    token: Token;
    mode: Mode;
}) {
    const label = status !== Status.Ready
        ? Status.label(status)
        : `${cap(mode)} ${token.symbol}`;
    return <Span aria-live="polite">{label}</Span>;
}
function ExecToggle() {
    const [show, set_show] = useTellerFlag();
    return <IconButton
        icon="bi-hdd-rack"
        icon-suffix="-fill"
        class={[
            "focus-ring", "focus-ring-primary",
            "btn", "btn-primary", "btn-lg",
        ]}
        onClick={() => {
            RWParams.portfolio = !show;
            set_show(!show);
        }}
        style={{ flex: "0 0 auto" }}
        title={ExecToggleTitle(show)}
        aria-label={ExecToggleTitle(show)}
        type="button"
    />;
}
function ExecToggleTitle(show: boolean) {
    if (show) {
        return "Hide Portfolio";
    } else {
        return "Show Portfolio";
    }
}
function ExecInfo(
    { mode, token }: { mode: Mode; token: Token; }
) {
    return <IconButton
        icon="bi-info-circle"
        icon-suffix="-fill"
        class={[
            "focus-ring", "focus-ring-primary",
            "btn", "btn-primary", "btn-lg",
        ]}
        style={{ flex: "0 0 auto" }}
        title={ExecInfoTitle(mode, token)}
        aria-label="Transaction info"
        bs-html="true"
        type="button"
    />;
}
function ExecInfoTitle(
    mode: Mode, token: Token,
) {
    const prefix = `${cap(mode)} ${token.symbol}`;
    if (mode === Mode.supply) {
        return `${prefix}: [CTRL] + click for *unlimited* approval`;
    } else {
        return `${prefix}: requires supplied collateral`;
    }
}
export default TellerExec;
