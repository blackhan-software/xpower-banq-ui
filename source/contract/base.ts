import { assert } from "@/function";
import { Address, Addressable } from "@/type";
import { Contract, ContractRunner, InterfaceAbi } from "ethers";

export abstract class BaseContract {
    abstract get abi(): InterfaceAbi;
    constructor(
        target: Address,
        runner: ContractRunner | null,
    ) {
        this._runner = runner;
        this._target = target;
    }
    get contract(): Contract {
        if (this._contract === null) {
            const target = this._target;
            assert(target, "missing target");
            this._contract = new Contract(
                Addressable.from(target),
                this.abi, this._runner
            );
        }
        return this._contract;
    }
    get runner() {
        return this._runner;
    }
    get target() {
        return this._target;
    }
    async with(selector: string): Promise<boolean | null> {
        if (this._with[selector] === undefined) {
            const code = await this.code();
            if (code) {
                this._with[selector] = code.includes(selector);
            }
        }
        return this._with[selector] ?? null;
    }
    async code(): Promise<string | null> {
        const key = `code:${this._target}`;
        let item = localStorage.getItem(key);
        if (item === null && this._runner?.provider) {
            item = await this._runner.provider.getCode(this._target);
            localStorage.setItem(key, item);
        }
        return item;
    }
    private _with: Record<string, boolean> = {};
    private _contract: Contract | null = null;
    private _runner: ContractRunner | null;
    private _target: Address;
}
export default BaseContract;
