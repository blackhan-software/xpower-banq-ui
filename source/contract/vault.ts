import { BaseContract } from "@/contract";
import { InterfaceAbi } from "ethers";
import ABI from "./vault-abi.json";
import { Address } from "@/type";

export type VaultFee = {
    /** entry fee of vault (basis points: 1e14) */
    entry: bigint;
    /** entry fee recipient */
    entryRecipient: Address;
    /** exit fee of vault (basis points: 1e14) */
    exit: bigint;
    /** exit fee recipient */
    exitRecipient: Address;
}
export class VaultContract extends BaseContract {
    /**
     * @returns asset underlying
     */
    asset(): Promise<Address> {
        return this.contract["asset"]!();
    }
    /**
     * @param assets amount to convert
     * @returns shares corresponding to assets
     */
    convertToShares(assets: bigint): Promise<bigint> {
        return this.contract["convertToShares"]!(assets);
    }
    /**
     * @param shares amount to convert
     * @returns assets corresponding to shares
     */
    convertToAssets(shares: bigint): Promise<bigint> {
        return this.contract["convertToAssets"]!(shares);
    }
    /**
     * @returns vault-fee structure
     */
    fee(): Promise<VaultFee> {
        return this.contract["fee"]!();
    }
    /**
     * @returns total amount of the underlying asset
     */
    totalAssets(): Promise<bigint> {
        return this.contract["totalAssets"]!();
    }
    /**
     * @returns utilization value
     */
    util(): Promise<bigint> {
        return this.contract["util"]!();
    }
    override get abi(): InterfaceAbi {
        return ABI;
    }
}
export default VaultContract;
