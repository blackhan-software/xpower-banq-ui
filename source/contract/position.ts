import { ERC20Contract } from "@/contract";
import { Address } from "@/type";
import { InterfaceAbi } from "ethers";
import ABI from "./position-abi.json";

interface IPositionContract {
    model(): Promise<[bigint, bigint, bigint]>;
    totalOf(user: string): Promise<bigint>;
    lockOf(user: string): Promise<bigint>;
    parameterOf(id: bigint): Promise<bigint>;
}
export class PositionContract extends ERC20Contract<IPositionContract> {
    /**
     * @returns [rate, spread, util]
     */
    model(): Promise<[
        rate: bigint, spread: bigint, util: bigint
    ]> {
        return this.contract.model();
    }
    /**
     * @param user address
     * @returns token balance (incl. interest)
     */
    totalOf(user: Address): Promise<bigint> {
        return this.contract.totalOf(user);
    }
    /**
     * @param user address; with 0x0 for total
     * @returns locked balance
     */
    lockOf(user: Address): Promise<bigint> {
        return this.contract.lockOf(user);
    }
    /**
     * @param id parameter identifier
     * @returns parameter value
     */
    parameterOf(id: bigint): Promise<bigint> {
        return this.contract.parameterOf(id);
    }
    override get abi(): InterfaceAbi {
        return ABI;
    }
}
export default PositionContract;
