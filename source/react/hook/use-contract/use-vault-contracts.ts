import { PoolContract, VaultContract } from "@/contract";
import { useContracts, usePoolContract, useRemoteProvider, usePoolTokens } from "@/react/hook";
import { Address, PoolToken } from "@/type";

export function useVaultContracts() {
    const [pool_contract] = usePoolContract();
    const [provider] = useRemoteProvider();
    const [tokens] = usePoolTokens(
        pool_contract?.target
    );
    return useContracts(VaultContract, {
        pool: pool_contract?.target ?? null,
        provider, targets: tokens,
    }, async () => {
        if (!pool_contract || !tokens) {
            return null;
        }
        const ta2va = await vaults_of(
            pool_contract, tokens
        );
        return ta2va.map(({ ta, va }) => ([
            PoolToken.from(pool_contract?.target, ta),
            new VaultContract(va, provider)
        ] as const));
    });
}
function vaults_of(
    pool: PoolContract,
    tokens: Address[],
) {
    return Promise.all(tokens.map(async (ta) => ({
        ta, va: await pool.vaultOf(ta)
    })));
}
export default useVaultContracts;
