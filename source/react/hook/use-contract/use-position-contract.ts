import { PoolContract, PositionContract } from "@/contract";
import { useContract, usePoolContract, useRemoteProvider } from "@/react/hook";
import { Address, Token } from "@/type";
import { Mode } from "@/type/mode";

export function usePositionContract(
    mode: Mode, token: Token,
) {
    const [pool_contract] = usePoolContract();
    const [provider] = useRemoteProvider();
    return useContract(PositionContract, {
        provider, target: token.address,
    }, async () => {
        if (!pool_contract) {
            return null;
        }
        const pa = await position_address(
            token.address, pool_contract, mode,
        );
        return new PositionContract(pa, provider);
    }, [
        mode, pool_contract?.target,
    ]);
}
function position_address(
    token_address: Address,
    pool: PoolContract,
    mode: Mode,
) {
    switch (mode) {
        case Mode.supply:
            return pool.supplyOf(token_address);
        case Mode.borrow:
            return pool.borrowOf(token_address);
    }
}
export default usePositionContract;
