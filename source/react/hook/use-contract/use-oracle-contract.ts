import { P000_ADDRESS, P001_ADDRESS, P002_ADDRESS, P003_ADDRESS, T000_ADDRESS, T001_ADDRESS, T002_ADDRESS, T003_ADDRESS } from "@/constant";
import { OracleContract } from "@/contract";
import { addressOf as x } from "@/function";
import { useContract, usePool, useRemoteProvider } from "@/react/hook";

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
const ORACLE_MAP = {
    [x(P000_ADDRESS)]: T000_ADDRESS,
    [x(P001_ADDRESS)]: T001_ADDRESS,
    [x(P002_ADDRESS)]: T002_ADDRESS,
    [x(P003_ADDRESS)]: T003_ADDRESS,
};
export default useOracleContract;
