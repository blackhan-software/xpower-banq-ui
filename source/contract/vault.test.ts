import { describe, expect, it, vi, beforeEach } from "vitest";
import { stubGlobals } from "@/test";

stubGlobals();

const mocks = vi.hoisted(() => ({
    asset: vi.fn().mockResolvedValue("0xASSET"),
    convertToShares: vi.fn().mockResolvedValue(950n),
    convertToAssets: vi.fn().mockResolvedValue(1050n),
    fee: vi.fn().mockResolvedValue({
        entry: 100n, entryRecipient: "0xFEE",
        exit: 200n, exitRecipient: "0xFEE",
    }),
    totalAssets: vi.fn().mockResolvedValue(1_000_000n),
    util: vi.fn().mockResolvedValue(750_000n),
    getNetwork: vi.fn().mockResolvedValue({ chainId: 43114n }),
}));

vi.mock("ethers", async () => {
    const actual = await vi.importActual("ethers");
    return {
        ...actual,
        Contract: vi.fn().mockImplementation(function () {
            return {
                asset: mocks.asset,
                convertToShares: mocks.convertToShares,
                convertToAssets: mocks.convertToAssets,
                fee: mocks.fee,
                totalAssets: mocks.totalAssets,
                util: mocks.util,
                target: "0xVAULT",
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

import { VaultContract } from "./vault";
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

describe("VaultContract", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
    it("should have an abi", () => {
        const vault = new VaultContract("0xVAULT", createRunner());
        expect(vault.abi).toBeDefined();
    });
    it("should delegate asset()", async () => {
        const vault = new VaultContract("0xVAULT", createRunner());
        expect(await vault.asset()).toBe("0xASSET");
    });
    it("should delegate convertToShares()", async () => {
        const vault = new VaultContract("0xVAULT", createRunner());
        expect(await vault.convertToShares(1000n)).toBe(950n);
        expect(mocks.convertToShares).toHaveBeenCalledWith(1000n);
    });
    it("should delegate convertToAssets()", async () => {
        const vault = new VaultContract("0xVAULT", createRunner());
        expect(await vault.convertToAssets(1000n)).toBe(1050n);
        expect(mocks.convertToAssets).toHaveBeenCalledWith(1000n);
    });
    it("should delegate fee()", async () => {
        const vault = new VaultContract("0xVAULT", createRunner());
        const fee = await vault.fee();
        expect(fee.entry).toBe(100n);
        expect(fee.exit).toBe(200n);
    });
    it("should delegate totalAssets()", async () => {
        const vault = new VaultContract("0xVAULT", createRunner());
        expect(await vault.totalAssets()).toBe(1_000_000n);
    });
    it("should delegate util()", async () => {
        const vault = new VaultContract("0xVAULT", createRunner());
        expect(await vault.util()).toBe(750_000n);
    });
});
