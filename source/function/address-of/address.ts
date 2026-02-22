import { Address } from "@/type";
import { ethers } from "ethers";
import assert from "../assert/assert";

/**
 * @returns a string representation of the address
 */
export function addressOf(
    n: bigint | Address,
): string {
    assert(
        typeof n === "bigint" ||
        typeof n === "string",
        "invalid address"
    );
    if (typeof n === "string") {
        n = BigInt(n);
    }
    return ethers.getAddress(
        `0x${n.toString(16).padStart(40, "0")}`
    );
}
/**
 * @returns an abbreviated string representation of the address
 */
export function abbressOf(
    n: bigint | Address,
    ellipsis = 4,
): string {
    const address = addressOf(n);
    if (ellipsis > 0) {
        const suffix = address.slice(-ellipsis);
        const prefix = address.slice(2, 2 + ellipsis);
        return `0x${prefix}…${suffix}`;
    }
    return address;
}
