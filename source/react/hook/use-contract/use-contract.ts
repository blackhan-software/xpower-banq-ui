import { BaseContract } from "@/contract";
import { Address } from "@/type";
import { ContractRunner } from "ethers";
import { DependencyList, useMemo, useState } from "react";

type Options = {
    /** target address */
    target: Address | null;
    /** provider contract-runner */
    provider: ContractRunner | null;
}
/**
 * Hook to use contract (with optional mapper).
 *
 * @param contract_ctor constructor of contract
 * @param options of contract
 * @param mapper factory
 *
 * @returns tuple of contract and setter
 */
export function useContract<
    TContract extends BaseContract,
    TOptions extends Options,
>(
    contract_ctor: Constructor<TContract>,
    options: TOptions, // including extras
    mapper?: Factory<TContract, TOptions>,
    deps?: DependencyList, // additional
) {
    const [contract, set_contract] = useState(
        null as TContract | null
    );
    const { provider, target } = options || {};
    useMemo(() => {
        const contract = Promise.resolve(
            (mapper ?? async_factory)(
                contract_ctor, options
            )
        );
        contract.then((c) => set_contract(c));
        return () => set_contract(null);
    }, [
        ...deps ?? [],
        contract_ctor,
        provider,
        target,
    ]);
    return [contract] as const;
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
    const { provider, target } = options || {};
    if (provider && target) {
        return new contract_ctor(target, provider);
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
export default useContract;
