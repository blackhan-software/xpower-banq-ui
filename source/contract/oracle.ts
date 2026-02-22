import { BaseContract } from "@/contract";
import { Address } from "@/type";
import { InterfaceAbi } from "ethers";
import ABI from "./oracle-abi.json";

interface IOracleContract {
    getQuotes(amount: bigint, source: string, target: string): Promise<[bigint, bigint]>;
    getQuote(amount: bigint, source: string, target: string): Promise<bigint>;
    maxQuote(amount: bigint, source: string, target: string): Promise<bigint>;
    minQuote(amount: bigint, source: string, target: string): Promise<bigint>;
}
export class OracleContract extends BaseContract<IOracleContract> {
    getQuotes(
        amount: bigint, source: Address, target: Address,
    ): Promise<[bigint, bigint]> {
        return this.contract.getQuotes(amount, source, target);
    }
    getQuote(
        amount: bigint, source: Address, target: Address,
    ): Promise<bigint> {
        return this.contract.getQuote(amount, source, target);
    }
    maxQuote(
        amount: bigint, source: Address, target: Address,
    ): Promise<bigint> {
        return this.contract.maxQuote(amount, source, target);
    }
    minQuote(
        amount: bigint, source: Address, target: Address,
    ): Promise<bigint> {
        return this.contract.minQuote(amount, source, target);
    }
    override get abi(): InterfaceAbi {
        return ABI;
    }
}
export default OracleContract;
