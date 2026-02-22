import { assert } from "@/function";
import { ChainIdCtx } from "@/react/context";
import { useContext } from "react";

export function useWalletChainId() {
    const ctx = useContext(ChainIdCtx);
    assert(ctx, "missing provider");
    return ctx;
}
export default useWalletChainId;
