import { assert } from "@/function";
import { WalletStatusCtx } from "@/react/context";
import { useContext } from "react";

export function useWalletStatus() {
    const ctx = useContext(WalletStatusCtx);
    assert(ctx, "missing provider");
    return ctx;
}
export default useWalletStatus;
