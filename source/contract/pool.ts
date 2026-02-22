import { BaseContract } from "@/contract";
import { assert } from "@/function";
import { Address } from "@/type";
import { IHasher, KeccakHasher } from '@blackhan-software/wasm-miner';
import { AbiCoder, getBytes, hexlify, id, InterfaceAbi, TransactionResponse } from "ethers";

import ABI from "./pool-abi.json";

interface IPoolContract {
    "capSupplyOf"(user: string, token: string): Promise<[bigint, bigint]>;
    "capBorrowOf"(user: string, token: string): Promise<[bigint, bigint]>;
    "capSupply"(token: string): Promise<[bigint, bigint]>;
    "capBorrow"(token: string): Promise<[bigint, bigint]>;
    "healthOf"(user: string): Promise<[bigint, bigint]>;
    "borrowOf"(token: string): Promise<string>;
    "supplyOf"(token: string): Promise<string>;
    "vaultOf"(token: string): Promise<string>;
    "tokens"(): Promise<string[]>;
    "supplyDifficultyOf"(token: string, amount: bigint): Promise<bigint>;
    "blockHash"(): Promise<string>;
    "supply(address,uint256,bool)"(token: string, amount: bigint, lock: boolean): Promise<TransactionResponse>;
    "supply(address,uint256)"(token: string, amount: bigint): Promise<TransactionResponse>;
    "redeem"(token: string, amount: bigint): Promise<TransactionResponse>;
    "borrowDifficultyOf"(token: string, amount: bigint): Promise<bigint>;
    "borrow(address,uint256,bool)"(token: string, amount: bigint, lock: boolean): Promise<TransactionResponse>;
    "borrow(address,uint256)"(token: string, amount: bigint): Promise<TransactionResponse>;
    "settle"(token: string, amount: bigint): Promise<TransactionResponse>;
    "lockSupply"(token: string, amount: bigint): Promise<TransactionResponse>;
    "lockBorrow"(token: string, amount: bigint): Promise<TransactionResponse>;
}
export class PoolContract extends BaseContract<IPoolContract> {
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
        return this.contract.capSupplyOf(user, token);
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
        return this.contract.capBorrowOf(user, token);
    }
    /**
     * @param token address
     * @returns supply-cap limit
     * @returns supply-cap duration
     */
    capSupply(token: Address): Promise<
        [limit: bigint, dt: bigint]
    > {
        return this.contract.capSupply(token);
    }
    /**
     * @param token address
     * @returns borrow-cap limit
     * @returns borrow-cap duration
     */
    capBorrow(token: Address): Promise<
        [limit: bigint, dt: bigint]
    > {
        return this.contract.capBorrow(token);
    }
    /**
     * @param user address
     * @returns [wnav_borrow, wnav_supply]
     */
    healthOf(user: Address): Promise<[bigint, bigint]> {
        return this.contract.healthOf(user);
    }
    /**
     * @param token address
     * @returns borrow-position address
     */
    borrowOf(token: Address): Promise<Address> {
        return this.memo(`borrowOf(${token})`, () => this.contract.borrowOf(token));
    }
    /**
     * @param token address
     * @returns supply-position address
     */
    supplyOf(token: Address): Promise<Address> {
        return this.memo(`supplyOf(${token})`, () => this.contract.supplyOf(token));
    }
    /**
     * @param token address
     * @returns vault address
     */
    vaultOf(token: Address): Promise<Address> {
        return this.memo(`vaultOf(${token})`, () => this.contract.vaultOf(token));
    }
    /**
     * @returns list of token addresses
     */
    tokens(): Promise<Address[]> {
        return this.memo("tokens", () => this.contract.tokens(), JSON);
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
     * @param ctx context
     * @returns tx-response
     */
    async supply(
        token: Address, amount: bigint, lock: boolean,
        ctx: { address: Address, signal: AbortSignal | null },
    ): Promise<TransactionResponse> {
        const difficulty: bigint = await this.contract.supplyDifficultyOf(
            token, amount,
        );
        if (difficulty > 0n) {
            const blockHash = await this.contract.blockHash();
            const data = supplyData(
                { address: token }, amount, lock,
            );
            assert(this.runner?.sendTransaction);
            return this.runner.sendTransaction({
                data: await pow(data, difficulty, {
                    ...ctx, blockHash,
                }),
                to: this.contract.target,
            });
        }
        if (lock) {
            return this.contract["supply(address,uint256,bool)"](
                token, amount, lock,
            );
        }
        return this.contract["supply(address,uint256)"](
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
        return this.contract.redeem(token, amount);
    }
    /**
     * Borrow tokens from the pool.
     *
     * @param token address
     * @param amount value
     * @param lock boolean
     * @param ctx context
     * @returns tx-response
     */
    async borrow(
        token: Address, amount: bigint, lock: boolean,
        ctx: { address: Address, signal: AbortSignal | null },
    ): Promise<TransactionResponse> {
        const difficulty: bigint = await this.contract.borrowDifficultyOf(
            token, amount
        );
        if (difficulty > 0n) {
            const blockHash = await this.contract.blockHash();
            const data = borrowData(
                { address: token }, amount, lock,
            );
            assert(this.runner?.sendTransaction);
            return this.runner.sendTransaction({
                data: await pow(data, difficulty, {
                    ...ctx, blockHash,
                }),
                to: this.contract.target,
            });
        }
        if (lock) {
            return this.contract["borrow(address,uint256,bool)"](
                token, amount, lock,
            );
        }
        return this.contract["borrow(address,uint256)"](
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
        return this.contract.settle(token, amount);
    }
    /**
     * Lock supply-position.
     *
     * @param token address
     * @param amount value
     * @returns tx-response
     */
    lockSupply(token: Address, amount: bigint): Promise<TransactionResponse> {
        return this.contract.lockSupply(token, amount);
    }
    /**
     * Lock borrow-position.
     *
     * @param token address
     * @param amount value
     * @returns tx-response
     */
    lockBorrow(token: Address, amount: bigint): Promise<TransactionResponse> {
        return this.contract.lockBorrow(token, amount);
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
    data: string, difficulty: bigint, ctx: {
        address: Address, blockHash: string, signal: AbortSignal | null
    },
): Promise<string> {
    const bytes = getBytes(
        ctx.blockHash + `${ctx.address}`.slice(2) + data.slice(2),
    );
    const hasher = await KeccakHasher();
    const zeros = Number(difficulty);
    const step = BigInt(4 ** zeros);
    for (let i = 0n; !ctx.signal?.aborted; i++) {
        const range: [bigint, bigint] = [step * i, step * (i + 1n)];
        const nonce = pow_wasm(hasher, bytes, range, zeros);
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
    throw new DOMException("PoW mining aborted", "AbortError");
}
/**
 * @returns proof-of-work nonce (or -1n if not found)
 */
function pow_wasm(
    hasher: IHasher,
    bytes: Uint8Array,
    range: [bigint, bigint],
    zeros: number,
): bigint {
    let nonce = -1n;
    hasher.reduce(bytes, {
        callback: (n) => { nonce = n; },
        range, zeros,
    });
    return nonce;
}
export default PoolContract;
