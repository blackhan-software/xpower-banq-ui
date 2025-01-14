import { VaultContract } from "@/contract";
import { useContract, usePoolContract, useRemoteProvider } from "@/react/hook";
import { Address, Token } from "@/type";
import { useEffect, useState } from "react";

export function useVaultContract(
    token: Token,
) {
    const [vault, set_vault] = useState<Address | null>(null);
    const [provider] = useRemoteProvider();
    const [pool] = usePoolContract();
    useEffect(() => {
        const va = pool?.vaultOf(token.address);
        Promise.resolve(va).then((a) => {
            if (a) set_vault(a);
        });
    }, [
        token.address,
        pool?.target,
    ]);
    return useContract(VaultContract, {
        provider, target: vault,
    });
}
export default useVaultContract;
