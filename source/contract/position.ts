import { ERC20Contract } from "@/contract";
import { Address } from "@/type";
import { InterfaceAbi } from "ethers";
import ABI from "./position-abi.json";

export class PositionContract extends ERC20Contract {
    /**
     * @returns [rate, spread, util]
     */
    model(): Promise<[
        rate: bigint, spread: bigint, util: bigint
    ]> {
        return this.contract["model"]!();
    }
    /**
     * @param user address
     * @returns token balance (incl. interest)
     */
    totalOf(user: Address): Promise<bigint> {
        return this.contract["totalOf"]!(user);
    }
    /**
     * @param user address; with 0x0 for total
     * @returns locked balance
     */
    lockOf(user: Address): Promise<bigint> {
        return this.contract["lockOf"]!(user);
    }
    override get abi(): InterfaceAbi {
        return ABI;
    }
}
export default PositionContract;
