import { ChainId, eth_chainId, ethereum, wallet_switchEthereumChain } from "@/blockchain";
import { ChainIdCtx } from "@/react/context";
import { ReactNode, useEffect, useState } from "react";

export function ChainIdPro(
    props: { children: ReactNode },
) {
    const [chain_id, set_chain_id] = useState<ChainId | null>(
        null
    );
    useEffect(/* init */() => {
        if (ethereum) {
            eth_chainId(ethereum)
                .then(ChainId.from)
                .then(set_chain_id);
        } else {
            set_chain_id(null);
        }
    }, [ethereum]);
    useEffect(/* sync */() => {
        const on_changed = (id: string | null) => {
            set_chain_id(ChainId.from(id));
        };
        if (ethereum) {
            ethereum.on("chainChanged", on_changed);
        }
        return () => {
            ethereum?.off("chainChanged", on_changed);
        };
    }, [ethereum]);
    const switch_to = async (
        id: ChainId | null
    ) => {
        const result = await wallet_switchEthereumChain(ethereum, {
            chainId: id ?? "",
        });
        if (result === null) {
            set_chain_id(ChainId.from(id));
        }
    };
    return <ChainIdCtx.Provider value={[
        chain_id, switch_to
    ]}>
        {props.children}
    </ChainIdCtx.Provider>;
}
export default ChainIdPro;
