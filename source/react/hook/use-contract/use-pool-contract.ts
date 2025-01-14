import { PoolContract } from "@/contract";
import { addressOf as x } from "@/function";
import { useContract, usePool, useRemoteProvider } from "@/react/hook";

export function usePoolContract() {
    const [provider] = useRemoteProvider();
    const [pool] = usePool();
    return useContract(PoolContract, {
        provider, target: x(pool),
    });
}
export default usePoolContract;
