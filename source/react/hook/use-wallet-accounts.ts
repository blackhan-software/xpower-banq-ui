import { assert } from "@/function";
import { AccountsCtx } from "@/react/context";
import { useContext } from "react";

export function useWalletAccounts() {
    const ctx = useContext(AccountsCtx);
    assert(ctx, "missing provider");
    return ctx;
}
export default useWalletAccounts;
