import { ERC20Contract } from "@/contract";
import { useContracts, usePoolContract, usePoolTokens } from "@/react/hook";
import { useRemoteProvider } from "../use-provider";

export function useTokenContracts() {
    const [provider] = useRemoteProvider();
    const [tokens] = usePoolTokens();
    const [pool] = usePoolContract();
    return useContracts(ERC20Contract, {
        pool: pool?.target ?? null,
        provider, targets: tokens,
    });
}
export default useTokenContracts;
