import { useWalletAccounts } from "@/react/hook";
import { Account } from "@/type";
import { appStore } from "@/zustand";
import { useEffect } from "react";

export function useWalletAccount() {
    const [accounts, connect] = useWalletAccounts();
    return [accounts?.[0] ?? null, connect] as const;
}
export function useWalletAccountSync(
    account: Account | null,
) {
    const { wallet_account, set_wallet_account } = appStore();
    useEffect(() => {
        if (wallet_account !== account) {
            set_wallet_account(account);
        }
    }, [
        wallet_account,
        account,
    ]);
    return [wallet_account, set_wallet_account] as const;
}
export default useWalletAccount;
