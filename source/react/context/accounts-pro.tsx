import { eth_accounts, eth_requestAccounts, ethereum } from "@/blockchain";
import { Cycle, Parser } from "@/function";
import { AccountsCtx } from "@/react/context";
import { Account } from "@/type";
import { RWParams } from "@/url";
import { ReactNode, useEffect, useState } from "react";

export function AccountsPro(
    props: { children: ReactNode },
) {
    const [accounts, set_accounts] = useState<Account[] | null>(
        null
    );
    useEffect(/* init */() => {
        eth_accounts(ethereum).then((addresses) => {
            set_accounts(sync(addresses, RWParams.account));
        });
    }, [ethereum]);
    useEffect(/* sync */() => {
        const on_changed = (addresses: string[]) => {
            const account = Parser.bigint(addresses[0], null);
            set_accounts(sync(addresses, account));
            RWParams.account = account;
        };
        ethereum?.on("accountsChanged", on_changed);
        return () => {
            ethereum?.off("accountsChanged", on_changed);
        };
    }, [ethereum]);
    const connect = async (
        account?: Account | null
    ) => {
        const addresses = await eth_requestAccounts(ethereum);
        set_accounts(sync(addresses, account));
        RWParams.account = account ?? null;
    };
    return <AccountsCtx.Provider value={[
        accounts, connect
    ]}>
        {props.children}
    </AccountsCtx.Provider>;
}
function sync(
    addresses: string[] | null,
    account?: Account | null,
): Account[] | null {
    const accounts = Account.of(addresses ?? []);
    if (account) {
        return Cycle.rotate(accounts, account) ?? [
            account, ...accounts
        ];
    }
    if (accounts.length) {
        return accounts;
    }
    return null;
}
export default AccountsPro;
