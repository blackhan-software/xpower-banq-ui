import { BaseContract } from "@/contract";
import { Address } from "@/type";
import { Symbol } from "@/type/symbol";
import { InterfaceAbi, Listener, TransactionResponse } from "ethers";
import ABI from "./erc20-abi.json";

export class ERC20Contract extends BaseContract {
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
        return this.contract["allowance"]!(owner, spender);
    }
    /**
     * @param spender address
     * @param value amount
     * @returns success
     */
    approve(spender: Address, value: bigint): Promise<TransactionResponse> {
        return this.contract["approve"]!(spender, value);
    }
    /**
     * @param user address
     * @returns token balance
     */
    balanceOf(user: Address): Promise<bigint> {
        return this.contract["balanceOf"]!(user);
    }
    /**
     * @returns token decimals
     */
    async decimals(): Promise<bigint> {
        const k = `${this.target}#decimals`;
        const v = sessionStorage.getItem(k);
        if (v === null) {
            const d = await this.contract["decimals"]!();
            sessionStorage.setItem(k, JSON.stringify(d));
            return d;
        }
        return JSON.parse(v);
    }
    /**
     * @returns token symbol
     */
    async symbol(): Promise<Symbol> {
        const k = `${this.target}#symbol`;
        const v = sessionStorage.getItem(k);
        if (v === null) {
            const s = await this.contract["symbol"]!();
            sessionStorage.setItem(k, s);
            return s;
        }
        return Symbol.cast(v);
    }
    /**
     * @returns token supply
     */
    totalSupply(): Promise<bigint> {
        return this.contract["totalSupply"]!();
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
export default BaseContract;
