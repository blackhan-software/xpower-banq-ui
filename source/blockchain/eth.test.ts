import { describe, expect, it, vi } from "vitest";
import { eth_accounts, eth_requestAccounts, eth_chainId } from "./eth";
import { Ethereum } from "./ethereum";

function mockEthereum(result: unknown): Ethereum {
    return { request: vi.fn().mockResolvedValue(result) } as unknown as Ethereum;
}

describe("eth_accounts", () => {
    it("should return accounts when available", async () => {
        const eth = mockEthereum(["0xabc"]);
        expect(await eth_accounts(eth)).toEqual(["0xabc"]);
        expect(eth.request).toHaveBeenCalledWith({
            method: "eth_accounts",
        });
    });
    it("should return null for empty array", async () => {
        expect(await eth_accounts(mockEthereum([]))).toBeNull();
    });
    it("should return null for undefined ethereum", async () => {
        expect(await eth_accounts(undefined)).toBeNull();
    });
});

describe("eth_requestAccounts", () => {
    it("should return accounts when available", async () => {
        const eth = mockEthereum(["0xabc", "0xdef"]);
        expect(await eth_requestAccounts(eth)).toEqual(["0xabc", "0xdef"]);
        expect(eth.request).toHaveBeenCalledWith({
            method: "eth_requestAccounts",
        });
    });
    it("should return null for empty array", async () => {
        expect(await eth_requestAccounts(mockEthereum([]))).toBeNull();
    });
    it("should return null for undefined ethereum", async () => {
        expect(await eth_requestAccounts(undefined)).toBeNull();
    });
});

describe("eth_chainId", () => {
    it("should return chain id", async () => {
        const eth = mockEthereum("0xa86a");
        expect(await eth_chainId(eth)).toBe("0xa86a");
        expect(eth.request).toHaveBeenCalledWith({
            method: "eth_chainId",
        });
    });
    it("should return null for empty string", async () => {
        expect(await eth_chainId(mockEthereum(""))).toBeNull();
    });
    it("should return null for undefined ethereum", async () => {
        expect(await eth_chainId(undefined)).toBeNull();
    });
});
