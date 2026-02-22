import { describe, expect, it, vi } from "vitest";
import { eth_accounts, eth_requestAccounts, eth_chainId } from "./eth";
import type { Ethereum } from "./ethereum";

function mockEthereum(result: unknown): Ethereum {
    return { request: vi.fn().mockResolvedValue(result) } as unknown as Ethereum;
}

type EthFn = (eth?: Ethereum) => Promise<unknown>;

describe.each<{ fn: EthFn; method: string; result: unknown; empty: unknown }>([
    { fn: eth_accounts, method: "eth_accounts", result: ["0xabc"], empty: [] },
    { fn: eth_requestAccounts, method: "eth_requestAccounts", result: ["0xabc", "0xdef"], empty: [] },
    { fn: eth_chainId, method: "eth_chainId", result: "0xa86a", empty: "" },
])("$method", ({ fn, method, result, empty }) => {
    it("should return result when available", async () => {
        const eth = mockEthereum(result);
        expect(await fn(eth)).toEqual(result);
        expect(eth.request).toHaveBeenCalledWith({ method });
    });
    it("should return null for empty value", async () => {
        expect(await fn(mockEthereum(empty))).toBeNull();
    });
    it("should return null for undefined ethereum", async () => {
        expect(await fn(undefined)).toBeNull();
    });
});
