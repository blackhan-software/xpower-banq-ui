import { BaseContract } from "@/contract";
import { assert } from "@/function";
import { Address } from "@/type";
import { IHasher, KeccakHasher } from '@blackhan-software/wasm-miner';
import { AbiCoder, getBytes, hexlify, id, InterfaceAbi, TransactionResponse } from "ethers";

import ABI from "./pool-abi.json";

export class PoolContract extends BaseContract {
    ///
    /// IPoolRW
    ///
    /**
     * @param user address
     * @param token address
     * @returns supply-cap limit of user
     * @returns supply-cap duration
     */
    capSupplyOf(user: Address, token: Address): Promise<
        [limit: bigint, dt: bigint]
    > {
        return this.contract["capSupplyOf"]!(user, token);
    }
    /**
     * @param user address
     * @param token address
     * @returns borrow-cap limit of user
     * @returns borrow-cap duration
     */
    capBorrowOf(user: Address, token: Address): Promise<
        [limit: bigint, dt: bigint]
    > {
        return this.contract["capBorrowOf"]!(user, token);
    }
    /**
     * @param token address
     * @returns supply-cap limit
     * @returns supply-cap duration
     */
    async capSupply(token: Address): Promise<
        [limit: bigint, dt: bigint]
    > {
        /** @todo: distinguish capSupply1 & capSupply2! */
        const n = await this.contract["capSupply"]!(token);
        return typeof n === "bigint" ? [n, 0n] : n;
    }
    /**
     * @param token address
     * @returns borrow-cap limit
     * @returns borrow-cap duration
     */
    async capBorrow(token: Address): Promise<
        [limit: bigint, dt: bigint]
    > {
        /** @todo: distinguish capBorrow1 & capBorrow2! */
        const n = await this.contract["capBorrow"]!(token);
        return typeof n === "bigint" ? [n, 0n] : n;
    }
    /**
     * @param user address
     * @returns [wnav_borrow, wnav_supply]
     */
    healthOf(user: Address): Promise<[bigint, bigint]> {
        return this.contract["healthOf"]!(user);
    }
    /**
     * @param token address
     * @returns borrow-position address
     */
    borrowOf(token: Address): Address {
        const k = `${this.target}#borrowOf(${token})`;
        const v = sessionStorage.getItem(k);
        if (v === null) {
            const a = this.contract["borrowOf"]!(token);
            a.then((v) => sessionStorage.setItem(k, v));
            return a;
        }
        return v;
    }
    /**
     * @param token address
     * @returns supply-position address
     */
    supplyOf(token: Address): Address {
        const k = `${this.target}#supplyOf(${token})`;
        const v = sessionStorage.getItem(k);
        if (v === null) {
            const a = this.contract["supplyOf"]!(token);
            a.then((v) => sessionStorage.setItem(k, v));
            return a;
        }
        return v;
    }
    /**
     * @param token address
     * @returns vault address
     */
    vaultOf(token: Address): Address {
        const k = `${this.target}#vaultOf(${token})`;
        const v = sessionStorage.getItem(k);
        if (v === null) {
            const a = this.contract["vaultOf"]!(token);
            a.then((v) => sessionStorage.setItem(k, v));
            return a;
        }
        return v;
    }
    /**
     * @returns list of token addresses
     */
    async tokens(): Promise<Address[]> {
        const k = `${this.target}#tokens`;
        const v = sessionStorage.getItem(k);
        if (v === null) {
            const t = await this.contract["tokens"]!();
            sessionStorage.setItem(k, JSON.stringify(t));
            return t;
        }
        return JSON.parse(v);
    }
    ///
    /// IPoolRW
    ///
    /**
     * Supply tokens into the pool.
     *
     * @param token address
     * @param amount value
     * @param lock boolean
     * @param user address
     * @returns tx-response
     */
    async supply(
        token: Address, amount: bigint, lock: boolean,
        { address }: { address: Address },
    ): Promise<TransactionResponse> {
        const difficulty: bigint = await this.contract["supplyDifficultyOf"]!(
            token, amount,
        );
        if (difficulty > 0n) {
            const blockHash = await this.contract["blockHash"]!();
            const data = supplyData(
                { address: token }, amount, lock,
            );
            assert(this.runner?.sendTransaction);
            return this.runner.sendTransaction({
                data: await pow(data, difficulty, {
                    address, blockHash,
                }),
                to: this.contract.target,
            });
        }
        if (lock) {
            return this.contract["supply(address,uint256,bool)"]!(
                token, amount, lock,
            );
        }
        return this.contract["supply(address,uint256)"]!(
            token, amount,
        );
    }
    /**
     * Redeem tokens from the pool.
     *
     * @param token address
     * @param amount value
     * @returns tx-response
     */
    redeem(token: Address, amount: bigint): Promise<TransactionResponse> {
        return this.contract["redeem"]!(token, amount);
    }
    /**
     * Borrow tokens from the pool.
     *
     * @param token address
     * @param amount value
     * @param lock boolean
     * @param user address
     * @returns tx-response
     */
    async borrow(
        token: Address, amount: bigint, lock: boolean,
        { address }: { address: Address },
    ): Promise<TransactionResponse> {
        const difficulty: bigint = await this.contract["borrowDifficultyOf"]!(
            token, amount
        );
        if (difficulty > 0n) {
            const blockHash = await this.contract["blockHash"]!();
            const data = borrowData(
                { address: token }, amount, lock,
            );
            assert(this.runner?.sendTransaction);
            return this.runner.sendTransaction({
                data: await pow(data, difficulty, {
                    address, blockHash,
                }),
                to: this.contract.target,
            });
        }
        if (lock) {
            return this.contract["borrow(address,uint256,bool)"]!(
                token, amount, lock,
            );
        }
        return this.contract["borrow(address,uint256)"]!(
            token, amount,
        );
    }
    /**
     * Settle tokens into the pool.
     *
     * @param token address
     * @param amount value
     * @returns tx-response
     */
    settle(token: Address, amount: bigint): Promise<TransactionResponse> {
        return this.contract["settle"]!(token, amount);
    }
    override get abi(): InterfaceAbi {
        return ABI;
    }
}
/**
 * @returns supply-data suffixed with proof-of-work nonce=0
 */
function supplyData(
    { address }: { address: Address }, amount: bigint, lock: boolean,
): string {
    const selector = id("supply(address,uint256,bool)").slice(0, 10);
    const args = AbiCoder.defaultAbiCoder().encode(
        ["address", "uint256", "bool", "uint256"],
        [address, amount, lock, 0n], // nonce
    );
    return selector + args.slice(2);
}
/**
 * @returns borrow-data suffixed with proof-of-work nonce=0
 */
function borrowData(
    { address }: { address: Address }, amount: bigint, lock: boolean,
): string {
    const selector = id("borrow(address,uint256,bool)").slice(0, 10);
    const args = AbiCoder.defaultAbiCoder().encode(
        ["address", "uint256", "bool", "uint256"],
        [address, amount, lock, 0n], // nonce
    );
    return selector + args.slice(2);
}
/**
 * @returns data suffixed with proof-of-work nonce>0
 */
async function pow(
    data: string, difficulty: bigint,
    ctx: { address: Address, blockHash: string },
): Promise<string> {
    const bytes = getBytes(
        ctx.blockHash + `${ctx.address}`.slice(2) + data.slice(2),
    );
    const hasher = await KeccakHasher();
    const zeros = Number(difficulty);
    const step = BigInt(4 ** zeros);
    for (let i = 0n; true; i++) {
        const range: [bigint, bigint] = [step * i, step * (i + 1n)];
        const nonce = await pow_wasm(hasher, bytes, range, zeros);
        if (nonce < 0n) continue; // failed; retry!
        bytes[bytes.length - 8] = Number((nonce >> 56n) & 0xffn);
        bytes[bytes.length - 7] = Number((nonce >> 48n) & 0xffn);
        bytes[bytes.length - 6] = Number((nonce >> 40n) & 0xffn);
        bytes[bytes.length - 5] = Number((nonce >> 32n) & 0xffn);
        bytes[bytes.length - 4] = Number((nonce >> 24n) & 0xffn);
        bytes[bytes.length - 3] = Number((nonce >> 16n) & 0xffn);
        bytes[bytes.length - 2] = Number((nonce >> 8n) & 0xffn);
        bytes[bytes.length - 1] = Number((nonce >> 0n) & 0xffn);
        return "0x" + hexlify(bytes).slice(106); // 2 + 64 + 40
    }
}
/**
 * @returns proof-of-work nonce (if available)
 */
function pow_wasm(
    hasher: IHasher,
    bytes: Uint8Array,
    range: [bigint, bigint],
    zeros: number,
): Promise<bigint> {
    return new Promise((resolve) => {
        hasher.reduce(bytes, {
            callback: resolve, range, zeros
        });
        resolve(-1n);
    });
}
export default PoolContract;
