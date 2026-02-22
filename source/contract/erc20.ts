import { BaseContract } from "@/contract";
import { Address } from "@/type";
import { Symbol } from "@/type/symbol";
import { InterfaceAbi, Listener, TransactionResponse } from "ethers";
import ABI from "./erc20-abi.json";

interface IERC20Contract {
    allowance(owner: string, spender: string): Promise<bigint>;
    approve(spender: string, value: bigint): Promise<TransactionResponse>;
    balanceOf(user: string): Promise<bigint>;
    decimals(): Promise<bigint>;
    symbol(): Promise<string>;
    totalSupply(): Promise<bigint>;
}
export class ERC20Contract<T = unknown> extends BaseContract<IERC20Contract & T> {
    /**
     * @param listener for transfer event
     */
    onTransfer(listener: TransferListener) {
        return this.contract.on("Transfer", listener);
    }
    /**
     * @param listener for transfer event
     */
    offTransfer(listener: TransferListener) {
        return this.contract.off("Transfer", listener);
    }
    /**
     * @param owner address
     * @param spender address
     * @returns token allowance
     */
    allowance(owner: Address, spender: Address): Promise<bigint> {
        return this.contract.allowance(owner, spender);
    }
    /**
     * @param spender address
     * @param value amount
     * @returns success
     */
    approve(spender: Address, value: bigint): Promise<TransactionResponse> {
        return this.contract.approve(spender, value);
    }
    /**
     * @param user address
     * @returns token balance
     */
    balanceOf(user: Address): Promise<bigint> {
        return this.contract.balanceOf(user);
    }
    /**
     * @returns token decimals
     */
    decimals(): Promise<bigint> {
        return this.memo("decimals", () => this.contract.decimals(), JSON);
    }
    /**
     * @returns token symbol
     */
    symbol(): Promise<Symbol> {
        return this.memo("symbol", () => this.contract.symbol(), {
            stringify: String, parse: Symbol.cast,
        });
    }
    /**
     * @returns token supply
     */
    totalSupply(): Promise<bigint> {
        return this.contract.totalSupply();
    }
    override get abi(): InterfaceAbi {
        return ABI;
    }
}
export interface TransferListener extends Listener {
    /**
     * @param from address
     * @param to address
     * @param amount of token
     */
    (from: string, to: string, amount: bigint): void;
};
export default ERC20Contract;
