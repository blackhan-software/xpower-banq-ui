import { describe, expect, it, vi } from "vitest";
import { wallet_addEthereumChain, wallet_switchEthereumChain } from "./wallet";
import { Ethereum } from "./ethereum";

function mockEthereum(result: unknown): Ethereum {
    return { request: vi.fn().mockResolvedValue(result) } as unknown as Ethereum;
}

describe("wallet_addEthereumChain", () => {
    const params = {
        chainId: "0xa86a",
        chainName: "Avalanche",
        nativeCurrency: { name: "AVAX", symbol: "AVAX", decimals: 18 },
        rpcUrls: ["https://api.avax.network/ext/bc/C/rpc"],
    };
    it("should return null on success", async () => {
        const eth = mockEthereum(null);
        expect(await wallet_addEthereumChain(eth, params)).toBeNull();
        expect(eth.request).toHaveBeenCalledWith({
            method: "wallet_addEthereumChain",
            params: [params],
        });
    });
    it("should return error on failure", async () => {
        const error = { code: 4001, message: "rejected" };
        const eth = mockEthereum(error);
        expect(await wallet_addEthereumChain(eth, params)).toEqual(error);
    });
    it("should return null for undefined ethereum", async () => {
        expect(await wallet_addEthereumChain(undefined, params)).toBeNull();
    });
});

describe("wallet_switchEthereumChain", () => {
    const params = { chainId: "0xa86a" };
    it("should return null on success", async () => {
        const eth = mockEthereum(null);
        expect(await wallet_switchEthereumChain(eth, params)).toBeNull();
        expect(eth.request).toHaveBeenCalledWith({
            method: "wallet_switchEthereumChain",
            params: [params],
        });
    });
    it("should return error on failure", async () => {
        const error = { code: 4902, message: "chain not added" };
        const eth = mockEthereum(error);
        expect(await wallet_switchEthereumChain(eth, params)).toEqual(error);
    });
    it("should return null for undefined ethereum", async () => {
        expect(await wallet_switchEthereumChain(undefined, params)).toBeNull();
    });
});
