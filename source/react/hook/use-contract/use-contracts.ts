// deno-lint-ignore-file require-await
import { BaseContract } from "@/contract";
import { Address, PoolToken } from "@/type";
import { ContractRunner } from "ethers";
import { DependencyList, useEffect, useState } from "react";

type Options = {
    pool: Address | null;
    /** target addresses */
    targets: Address[] | null;
    /** provider contract-runner */
    provider: ContractRunner | null;
};
/**
 * Hook to use contracts (with optional mapper).
 *
 * @param contract_ctor constructor of contracts
 * @param options of contracts
 * @param mapper factory
 *
 * @returns tuple of contract map and setter
 */
export function useContracts<
    TContract extends BaseContract,
    TOptions extends Options,
>(
    contract_ctor: Constructor<TContract>,
    options: TOptions, // including extras
    mapper?: Factory<TContract, TOptions>,
    deps?: DependencyList, // additional
) {
    const [map, set_map] = useState<
        null | Map<PoolToken, TContract>
    >(
        null
    );
    const { provider, targets, pool } = options || {};
    useEffect(() => {
        let cancelled = false;
        const contracts = Promise.resolve(
            (mapper ?? async_factory)(
                contract_ctor, options
            )
        );
        contracts.then((items) => {
            if (!cancelled) set_map(new Map(items));
        });
        return () => {
            cancelled = true;
            set_map(null);
        };
    }, [
        ...deps ?? [],
        contract_ctor,
        provider,
        targets,
        pool,
    ]);
    return [map] as const;
}
/**
 * @returns a new contract instance (a)synchronously.
 */
async function async_factory<
    TContract extends BaseContract,
    TOptions extends Options,
>(
    contract_ctor: Constructor<TContract>,
    options?: TOptions, // including extras
) {
    const { provider, targets, pool } = options || {};
    if (provider && targets && pool) {
        return targets.map((t): [PoolToken, TContract] => [
            PoolToken.from(pool, t), new contract_ctor(t, provider),
        ] as const);
    }
    return null;
}
type Factory<
    TContract extends BaseContract,
    TOptions extends Options,
> = typeof async_factory<TContract, TOptions>;
type Constructor<
    TContract extends BaseContract
> = new (
    target: Address,
    provider: ContractRunner | null,
) => TContract;
export default useContracts;
