import { describe, expect, it, vi, beforeEach } from "vitest";

function createStorage() {
    const store = new Map<string, string>();
    return {
        getItem: vi.fn((key: string) => store.get(key) ?? null),
        setItem: vi.fn((key: string, val: string) => { store.set(key, val); }),
        removeItem: vi.fn((key: string) => { store.delete(key); }),
    };
}

vi.stubGlobal("localStorage", createStorage());
vi.stubGlobal("sessionStorage", createStorage());
vi.stubGlobal("location", { search: "", hash: "", pathname: "/" });

const mocks = vi.hoisted(() => ({
    balanceOf: vi.fn().mockResolvedValue(1000n * 10n ** 18n),
    allowance: vi.fn().mockResolvedValue(500n * 10n ** 18n),
    approve: vi.fn().mockResolvedValue({ hash: "0xAPPROVE" }),
    decimals: vi.fn().mockResolvedValue(18),
    symbol: vi.fn().mockResolvedValue("XPOW"),
    totalSupply: vi.fn().mockResolvedValue(1_000_000n * 10n ** 18n),
    on: vi.fn(),
    off: vi.fn(),
    getNetwork: vi.fn().mockResolvedValue({ chainId: 43114n }),
}));

vi.mock("ethers", async () => {
    const actual = await vi.importActual("ethers");
    return {
        ...actual,
        Contract: vi.fn().mockImplementation(function () {
            return {
                balanceOf: mocks.balanceOf,
                allowance: mocks.allowance,
                approve: mocks.approve,
                decimals: mocks.decimals,
                symbol: mocks.symbol,
                totalSupply: mocks.totalSupply,
                on: mocks.on,
                off: mocks.off,
                target: "0xERC20",
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

import { ERC20Contract } from "@/contract";
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

describe("ERC20Contract", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal("sessionStorage", createStorage());
    });
    it("should have an abi", () => {
        const erc20 = new ERC20Contract("0xERC20", createRunner());
        expect(erc20.abi).toBeDefined();
    });
    describe("delegation", () => {
        it("should delegate balanceOf", async () => {
            const erc20 = new ERC20Contract("0xERC20", createRunner());
            const balance = await erc20.balanceOf("0xUSER");
            expect(balance).toBe(1000n * 10n ** 18n);
            expect(mocks.balanceOf).toHaveBeenCalledWith("0xUSER");
        });
        it("should delegate allowance", async () => {
            const erc20 = new ERC20Contract("0xERC20", createRunner());
            const allowance = await erc20.allowance("0xOWNER", "0xSPENDER");
            expect(allowance).toBe(500n * 10n ** 18n);
            expect(mocks.allowance).toHaveBeenCalledWith("0xOWNER", "0xSPENDER");
        });
        it("should delegate approve", async () => {
            const erc20 = new ERC20Contract("0xERC20", createRunner());
            const tx = await erc20.approve("0xSPENDER", 100n);
            expect(tx).toEqual({ hash: "0xAPPROVE" });
            expect(mocks.approve).toHaveBeenCalledWith("0xSPENDER", 100n);
        });
        it("should delegate totalSupply", async () => {
            const erc20 = new ERC20Contract("0xERC20", createRunner());
            const supply = await erc20.totalSupply();
            expect(supply).toBe(1_000_000n * 10n ** 18n);
        });
    });
    describe("decimals (caching)", () => {
        it("should call contract and cache in sessionStorage", async () => {
            const erc20 = new ERC20Contract("0xERC20", createRunner());
            const decimals = await erc20.decimals();
            expect(decimals).toBe(18);
            expect(mocks.decimals).toHaveBeenCalled();
        });
        it("should return cached value on second call", async () => {
            const erc20 = new ERC20Contract("0xERC20", createRunner());
            await erc20.decimals();
            mocks.decimals.mockClear();
            const decimals = await erc20.decimals();
            expect(decimals).toBe(18);
            expect(mocks.decimals).not.toHaveBeenCalled();
        });
    });
    describe("symbol (caching)", () => {
        it("should call contract and cache in sessionStorage", async () => {
            const erc20 = new ERC20Contract("0xERC20", createRunner());
            const symbol = await erc20.symbol();
            expect(symbol).toBe("XPOW");
            expect(mocks.symbol).toHaveBeenCalled();
        });
        it("should return cached value on second call", async () => {
            const erc20 = new ERC20Contract("0xERC20", createRunner());
            await erc20.symbol();
            mocks.symbol.mockClear();
            const symbol = await erc20.symbol();
            expect(symbol).toBe("XPOW");
            expect(mocks.symbol).not.toHaveBeenCalled();
        });
    });
    describe("events", () => {
        it("should subscribe to Transfer event", () => {
            const erc20 = new ERC20Contract("0xERC20", createRunner());
            const listener = vi.fn();
            erc20.onTransfer(listener);
            expect(mocks.on).toHaveBeenCalledWith("Transfer", listener);
        });
        it("should unsubscribe from Transfer event", () => {
            const erc20 = new ERC20Contract("0xERC20", createRunner());
            const listener = vi.fn();
            erc20.offTransfer(listener);
            expect(mocks.off).toHaveBeenCalledWith("Transfer", listener);
        });
    });
});
