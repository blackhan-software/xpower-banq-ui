import { abbressOf, buffered, nomobi, Parser, addressOf as x } from "@/function";
import { Datalist, Div, Input, Option } from "@/react/element";
import { useKeyUp, useWalletAccounts } from "@/react/hook";
import { Address, type Account } from "@/type";
import React, { useEffect, useState } from "react";
import { Cycle } from "../../function";
import { IconButton } from "../lib.button";
import { QRCode } from "./qr-code";

export function AppWallet(
    { spin_ms = 400 }
) {
    const [accounts, connect] = useWalletAccounts();
    return <>
        <Div role="group" class={[
            "app-wallet", "btn-group", "w-100",
            "d-none", "d-sm-flex",
        ]}>
            <WalletQRCode accounts={accounts} />
            {Wallet({ accounts, connect, spin_ms })}
        </Div>
        <Div role="group" class={[
            "app-wallet", "btn-group", "w-100",
            "d-flex", "d-sm-none",
        ]}>
            {Wallet({ accounts, connect, spin_ms })}
        </Div>
    </>;
}
function Wallet({ accounts, connect, spin_ms }: {
    connect: (account?: Account | null) => void;
    accounts: Account[] | null;
    spin_ms: number;
}) {
    const curr = accounts?.[0] ?? null;
    const prev = Cycle.prev(accounts);
    const next = Cycle.next(accounts);
    return <>
        <PrevAccount
            curr={curr} prev={prev}
            connect={connect}
            spin_ms={spin_ms}
        />
        <WalletAccount
            accounts={accounts}
            connect={connect}
        />
        <WalletAccounts
            accounts={accounts}
        />
        <NextAccount
            curr={curr} next={next}
            connect={connect}
            spin_ms={spin_ms}
        />
    </>;
}
function WalletQRCode({ accounts }: {
    accounts: Account[] | null;
}) {
    return <QRCode
        class={[
            "focus-ring", "focus-ring-primary",
            "btn btn-outline-primary qr-code",
        ]}
        data={accounts?.[0] ? x(accounts[0]) : ""}
    />;
}
function WalletAccount({ accounts, connect }: {
    connect: (account?: Account | null) => void;
    accounts: Account[] | null;
}) {
    const ref = React.createRef<HTMLInputElement>();
    const account = accounts?.[0] ?? 0n;
    useEffect(() => {
        if (ref.current) {
            ref.current.value = abbressOf(account);
        }
    }, [
        account,
    ]);
    return <Input
        class={[
            "focus-ring", "focus-ring-primary",
            "border-start-0 border-end-0",
            "btn", "btn-outline-primary",
            "form-control",
        ]}
        style={{
            minWidth: "144px"
        }}
        onFocus={(e) => {
            e.target.value = "";
        }}
        onBlur={(e) => {
            e.target.value = abbressOf(account);
        }}
        onKeyDown={(e) => {
            if (e.key === "Escape") {
                ref.current?.blur();
            }
        }}
        onChange={(e) => {
            const option = document.querySelector<HTMLOptionElement>(
                `#wallet-accounts>option[value="${e.target.value}"]`
            );
            if (option) {
                const account = Parser.bigint(option.label, null);
                if (account) {
                    connect(account);
                }
                return;
            }
            if (Address.isAddress(e.target.value)) {
                const account = Parser.bigint(e.target.value, null);
                if (account) {
                    connect(account);
                }
                return;
            }
        }}
        onWheel={buffered((e) => {
            if (e.deltaY < 0) {
                const next = Cycle.next(accounts ?? [], account);
                if (next) connect(next);
                return;
            }
            if (e.deltaY > 0) {
                const prev = Cycle.prev(accounts ?? [], account);
                if (prev) connect(prev);
                return;
            }
        })}
        defaultValue={abbressOf(account)}
        placeholder="Account…"
        list="wallet-accounts"
        spellCheck={false}
        role="button"
        ref={ref}
    />;
}
function WalletAccounts({ accounts }: {
    accounts: Account[] | null;
}) {
    if (accounts?.length) {
        return <Datalist id="wallet-accounts">{accounts.map((a, i) =>
            <Option key={i} label={x(a)} value={abbressOf(a)} />
        )}</Datalist>;
    }
    return null;
}
function PrevAccount({ curr, prev, connect, spin_ms }: {
    connect: (account?: Account | null) => void;
    curr: Account | null;
    prev: Account | null;
    spin_ms: number;
}) {
    const [spin, set_spin] = useState(false);
    useKeyUp("ArrowLeft", () => {
        document.getElementById("prev-account")?.click();
    }, {
        ctrlKey: true, shiftKey: true,
    });
    return <IconButton id="prev-account"
        class={[
            "focus-ring", "focus-ring-primary",
            "btn", "btn-outline-primary",
            "border-end-0",
        ]}
        onClick={buffered(() => {
            if (!prev) return;
            setTimeout(
                () => set_spin(false), spin_ms
            );
            set_spin(true);
            connect(prev);
        })}
        title={nomobi("Previous Account [CTRL+SHIFT+⬅]")}
        disabled={!prev || prev === curr}
        data-bs-placement="bottom"
        icon="bi-caret-left"
        icon-spin={spin}
        type="button"
    />;
}
function NextAccount({ curr, next, connect, spin_ms }: {
    connect: (account?: Account | null) => void;
    curr: Account | null;
    next: Account | null;
    spin_ms: number;
}) {
    const [spin, set_spin] = useState(false);
    useKeyUp("ArrowRight", () => {
        document.getElementById("next-account")?.click();
    }, {
        ctrlKey: true, shiftKey: true,
    });
    return <IconButton id="next-account"
        class={[
            "focus-ring", "focus-ring-primary",
            "btn", "btn-outline-primary",
            "border-start-0",
        ]}
        onClick={buffered(() => {
            if (!next) return;
            setTimeout(
                () => set_spin(false), spin_ms
            );
            set_spin(true);
            connect(next);
        })}
        title={nomobi("Next")} // Account [CTRL+SHIFT+➡]
        disabled={!next || next === curr}
        data-bs-placement="bottom"
        icon="bi-caret-right"
        icon-spin={spin}
        type="button"
    />;
}
export default AppWallet;
