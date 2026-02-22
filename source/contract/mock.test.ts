import { describe, expect, it, vi } from "vitest";
import { stubGlobals } from "@/test";

stubGlobals();

vi.mock("@/constant", async () =>
    (await import("@/test/constants")).MOCK_CONSTANTS
);
vi.mock("@/function", async (importOriginal) =>
    (await import("@/test")).mockFunction(importOriginal)
);

import { ContractRunner, Provider, TransactionRequest } from "ethers";

/**
 * MockProvider: a minimal ContractRunner stub for tests.
 * Provides predictable return values without RPC calls.
 */
export class MockProvider implements ContractRunner {
    provider: Provider | null = null;
    async call(_tx: TransactionRequest): Promise<string> {
        return "0x";
    }
}

/**
 * MockERC20Data: predictable ERC-20 responses.
 */
export const MockERC20Data = {
    balanceOf: 1000n * 10n ** 18n,
    allowance: 500n * 10n ** 18n,
    decimals: 18n,
    symbol: "MOCK",
    totalSupply: 1_000_000n * 10n ** 18n,
};

/**
 * MockPoolData: predictable pool contract responses.
 */
export const MockPoolData = {
    healthOf: [100n, 200n] as [bigint, bigint],
    tokens: [
        "0x0000000000000000000000000000000000000064",
        "0x0000000000000000000000000000000000000065",
    ],
};

describe("MockProvider", () => {
    it("should be constructable as ContractRunner", () => {
        const provider = new MockProvider();
        expect(provider).toBeDefined();
        expect(provider.provider).toBeNull();
    });
    it("should return 0x from call", async () => {
        const provider = new MockProvider();
        const result = await provider.call({});
        expect(result).toBe("0x");
    });
});

describe("MockERC20Data", () => {
    it("should provide predictable balanceOf", () => {
        expect(MockERC20Data.balanceOf).toBe(1000n * 10n ** 18n);
    });
    it("should provide predictable decimals", () => {
        expect(MockERC20Data.decimals).toBe(18n);
    });
    it("should provide predictable symbol", () => {
        expect(MockERC20Data.symbol).toBe("MOCK");
    });
});

describe("MockPoolData", () => {
    it("should provide healthOf tuple", () => {
        const [borrow, supply] = MockPoolData.healthOf;
        expect(borrow).toBe(100n);
        expect(supply).toBe(200n);
    });
    it("should provide tokens array", () => {
        expect(MockPoolData.tokens).toHaveLength(2);
        expect(MockPoolData.tokens[0]).toMatch(/^0x/);
    });
});
