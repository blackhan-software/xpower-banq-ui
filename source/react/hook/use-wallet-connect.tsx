import { Status, ChainId } from "@/blockchain";
import { useWalletStatus, useWalletAccount, useWalletChainId } from "@/react/hook";

export function useWalletConnect() {
    const [__, switch_to] = useWalletChainId();
    const [_, connect] = useWalletAccount();
    const [status] = useWalletStatus();
    const action = () => {
        switch (status) {
            case Status.WrongNetwork:
                switch_to(ChainId.AVALANCHE_MAINNET);
                return;
            case Status.NoAccounts:
                connect();
                return;
            case Status.Ready:
                return;
            default:
                open("https://metamask.io", "_blank");
        }
    };
    return [status, action] as const;
}
