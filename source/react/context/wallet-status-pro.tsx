import { ChainId, Status } from "@/blockchain";
import { WalletStatusCtx } from "@/react/context";
import { ReactNode, useEffect, useState } from "react";
import { useWalletAccounts, useWalletChainId } from "../hook";

export function WalletStatusPro(
    props: { children: ReactNode },
) {
    const [status, set_status] = useState<Status | null>(
        null
    );
    const [chain_id] = useWalletChainId();
    const [accounts] = useWalletAccounts();
    useEffect(() => {
        if (chain_id && !ChainId.isAvalanche(chain_id)) {
            set_status(Status.WrongNetwork);
            return;
        }
        if (chain_id && !accounts?.length) {
            set_status(Status.NoAccounts);
            return;
        }
        if (chain_id && accounts?.[0]) {
            set_status(Status.Ready);
            return;
        }
        if (chain_id === null) {
            set_status(Status.NoProvider);
            return;
        }
        set_status(null);
    }, [
        chain_id,
        accounts,
    ]);
    return <WalletStatusCtx.Provider value={[
        status, set_status
    ]}>
        {props.children}
    </WalletStatusCtx.Provider>;
}
export default WalletStatusPro;
