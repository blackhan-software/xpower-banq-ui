import { PoolContract, PositionContract } from "@/contract";
import { useContracts, usePoolContract, useRemoteProvider, usePoolTokens } from "@/react/hook";
import { Address, PoolToken } from "@/type";
import { Mode } from "@/type/mode";

export function usePositionContracts(
    mode: Mode,
) {
    const [pool_contract] = usePoolContract();
    const [provider] = useRemoteProvider();
    const [tokens] = usePoolTokens(
        pool_contract?.target
    );
    return useContracts(PositionContract, {
        pool: pool_contract?.target ?? null,
        provider, targets: tokens,
    }, async () => {
        if (!pool_contract || !tokens) {
            return null;
        }
        const ta2pa = await Promise.all(tokens.map(async (ta) => ({
            ta, pa: await position_address(ta, pool_contract, mode)
        })));
        return ta2pa.map(({ ta, pa }) => ([
            PoolToken.from(pool_contract?.target, ta),
            new PositionContract(pa, provider)
        ] as const));
    }, [
        mode,
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
export default usePositionContracts;
