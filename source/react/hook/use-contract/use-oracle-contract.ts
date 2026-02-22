import { useContract, usePool, useRemoteProvider } from "@/react/hook";

import { T000_ADDRESS } from "@/constant";
import { OracleContract } from "@/contract";
import { addressOf as x } from "@/function";
import { ORACLE_MAP } from "@/type";

export function useOracleContract() {
    const [provider] = useRemoteProvider();
    const [oracle] = useOracleAddress();
    return useContract(OracleContract, {
        provider, target: x(oracle),
    });
}
function useOracleAddress(): [bigint] {
    const [pool] = usePool();
    if (pool !== null) {
        const address = ORACLE_MAP[x(pool)];
        if (address) return [address];
    }
    return [T000_ADDRESS];
}
export default useOracleContract;
