import { describe, expect, it, vi, beforeEach } from "vitest";
import { stubGlobals } from "@/test";

stubGlobals();

const mocks = vi.hoisted(() => ({
    getQuotes: vi.fn().mockResolvedValue([90n, 110n]),
    getQuote: vi.fn().mockResolvedValue(100n),
    maxQuote: vi.fn().mockResolvedValue(110n),
    minQuote: vi.fn().mockResolvedValue(90n),
    getNetwork: vi.fn().mockResolvedValue({ chainId: 43114n }),
}));

vi.mock("ethers", async () => {
    const actual = await vi.importActual("ethers");
    return {
        ...actual,
        Contract: vi.fn().mockImplementation(function () {
            return {
                getQuotes: mocks.getQuotes,
                getQuote: mocks.getQuote,
                maxQuote: mocks.maxQuote,
                minQuote: mocks.minQuote,
                target: "0xORACLE",
            };
        }),
    };
});
vi.mock("@/constant", async () =>
    (await import("@/test/constants")).MOCK_CONSTANTS
);
vi.mock("@/function", async (importOriginal) =>
    (await import("@/test")).mockFunction(importOriginal)
);

import { OracleContract } from "./oracle";
import { ContractRunner } from "ethers";

function createRunner() {
    return {
        provider: {
            getCode: vi.fn().mockResolvedValue("0x"),
            getNetwork: mocks.getNetwork,
        },
        call: vi.fn().mockResolvedValue("0x"),
    } as unknown as ContractRunner;
}

describe("OracleContract", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
    it("should have an abi", () => {
        const oracle = new OracleContract("0xORACLE", createRunner());
        expect(oracle.abi).toBeDefined();
    });
    it("should delegate getQuotes()", async () => {
        const oracle = new OracleContract("0xORACLE", createRunner());
        const [bid, ask] = await oracle.getQuotes(1000n, "0xSRC", "0xTGT");
        expect(bid).toBe(90n);
        expect(ask).toBe(110n);
        expect(mocks.getQuotes).toHaveBeenCalledWith(1000n, "0xSRC", "0xTGT");
    });
    it("should delegate getQuote()", async () => {
        const oracle = new OracleContract("0xORACLE", createRunner());
        const mid = await oracle.getQuote(1000n, "0xSRC", "0xTGT");
        expect(mid).toBe(100n);
        expect(mocks.getQuote).toHaveBeenCalledWith(1000n, "0xSRC", "0xTGT");
    });
    it("should delegate maxQuote()", async () => {
        const oracle = new OracleContract("0xORACLE", createRunner());
        const ask = await oracle.maxQuote(1000n, "0xSRC", "0xTGT");
        expect(ask).toBe(110n);
        expect(mocks.maxQuote).toHaveBeenCalledWith(1000n, "0xSRC", "0xTGT");
    });
    it("should delegate minQuote()", async () => {
        const oracle = new OracleContract("0xORACLE", createRunner());
        const bid = await oracle.minQuote(1000n, "0xSRC", "0xTGT");
        expect(bid).toBe(90n);
        expect(mocks.minQuote).toHaveBeenCalledWith(1000n, "0xSRC", "0xTGT");
    });
});
