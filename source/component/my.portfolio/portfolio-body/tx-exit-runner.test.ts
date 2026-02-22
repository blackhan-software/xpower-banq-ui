import { describe, expect, it, vi, beforeEach, type Mock } from "vitest";
import { stubGlobals } from "@/test";

stubGlobals();

const mocks = vi.hoisted(() => ({
    redeem: vi.fn().mockResolvedValue({ wait: vi.fn() }),
    settle: vi.fn().mockResolvedValue({ wait: vi.fn() }),
    vaultOf: vi.fn().mockResolvedValue("0xvault"),
    supplyOf: vi.fn().mockResolvedValue("0xsupply_pos"),
    borrowOf: vi.fn().mockResolvedValue("0xborrow_pos"),
    allowance: vi.fn().mockResolvedValue(0n),
    approve: vi.fn().mockResolvedValue({ wait: vi.fn() }),
    tokenBalanceOf: vi.fn().mockResolvedValue(1000n * 10n ** 18n),
    posTotalOf: vi.fn().mockResolvedValue(500n * 10n ** 18n),
    posLockOf: vi.fn().mockResolvedValue(100n * 10n ** 18n),
    fee: vi.fn().mockResolvedValue({
        entry: 100, entryRecipient: "0x0",
        exit: 200, exitRecipient: "0x0",
    }),
    convertToAssets: vi.fn().mockResolvedValue(999n * 10n ** 18n),
    isCallException: vi.fn().mockReturnValue(false),
    parseError: vi.fn().mockReturnValue(null),
    walletProvider: vi.fn().mockResolvedValue({
        getSigner: vi.fn().mockResolvedValue({
            getAddress: vi.fn().mockResolvedValue("0x1234"),
        }),
    }),
}));

vi.mock("@/blockchain", () => ({
    WalletProvider: mocks.walletProvider,
}));
vi.mock("@/contract", () => ({
    PoolContract: vi.fn().mockImplementation(function () {
        return {
            target: "0xpool",
            runner: {},
            redeem: mocks.redeem,
            settle: mocks.settle,
            vaultOf: mocks.vaultOf,
            supplyOf: mocks.supplyOf,
            borrowOf: mocks.borrowOf,
        };
    }),
    ERC20Contract: vi.fn().mockImplementation(function () {
        return {
            target: "0xtoken",
            allowance: mocks.allowance,
            approve: mocks.approve,
            balanceOf: mocks.tokenBalanceOf,
        };
    }),
    VaultContract: vi.fn().mockImplementation(function () {
        return {
            fee: mocks.fee,
            convertToAssets: mocks.convertToAssets,
        };
    }),
    PositionContract: vi.fn().mockImplementation(function () {
        return {
            totalOf: mocks.posTotalOf,
            lockOf: mocks.posLockOf,
        };
    }),
}));
vi.mock("@/constant", async () =>
    (await import("@/test/constants")).MOCK_CONSTANTS
);
vi.mock("@/function", async (importOriginal) =>
    (await import("@/test")).mockFunction(importOriginal)
);
vi.mock("@/contract/position-abi.json", () => ({ default: [] }));
vi.mock("@/contract/vault-abi.json", () => ({ default: [] }));
vi.mock("ethers", async (importOriginal) => {
    const actual = await importOriginal<typeof import("ethers")>();
    return {
        ...actual,
        isCallException: mocks.isCallException,
        Interface: vi.fn().mockImplementation(function () {
            return { parseError: mocks.parseError };
        }),
    };
});

import { TxRunner } from "./tx-exit-runner";
import { Mode, Position, Symbol } from "@/type";

const MOCK_POSITION: Position = {
    address: "0x0000000000000000000000000000000000000064",
    decimals: 18n,
    supply: 1000000n,
    symbol: Symbol.APOW,
    amount: 500n * 10n ** 18n,
    locked: 100n * 10n ** 18n,
    lockedTotal: 200n * 10n ** 18n,
    cap: { supply: [0n, 0n], borrow: [0n, 0n] },
    capTotal: { supply: [0n, 0n], borrow: [0n, 0n] },
};

describe("TxRunner (portfolio-body)", () => {
    let alertSpy: Mock;
    let promptSpy: Mock;

    beforeEach(() => {
        vi.clearAllMocks();
        alertSpy = vi.fn();
        promptSpy = vi.fn().mockReturnValue("100");
        vi.stubGlobal("alert", alertSpy);
        vi.stubGlobal("prompt", promptSpy);
        mocks.allowance.mockResolvedValue(0n);
        mocks.isCallException.mockReturnValue(false);
        mocks.redeem.mockResolvedValue({ wait: vi.fn() });
        mocks.settle.mockResolvedValue({ wait: vi.fn() });
    });

    describe("routing", () => {
        it("should call redeem when mode is supply", async () => {
            await TxRunner(1n, 300n, Mode.supply, {
                amount: 100, position: MOCK_POSITION, ctrl: false,
            });
            expect(mocks.redeem).toHaveBeenCalled();
        });
        it("should call settle when mode is borrow", async () => {
            await TxRunner(1n, 300n, Mode.borrow, {
                amount: 100, position: MOCK_POSITION, ctrl: false,
            });
            expect(mocks.settle).toHaveBeenCalled();
        });
    });

    describe("redeem flow", () => {
        it("should fetch position balances", async () => {
            await TxRunner(1n, 300n, Mode.supply, {
                amount: 100, position: MOCK_POSITION, ctrl: false,
            });
            expect(mocks.posTotalOf).toHaveBeenCalled();
            expect(mocks.posLockOf).toHaveBeenCalled();
        });
        it("should alert on zero amount from prompt", async () => {
            promptSpy.mockReturnValue("0");
            await TxRunner(1n, 300n, Mode.supply, {
                amount: null, position: MOCK_POSITION, ctrl: false,
            });
            expect(alertSpy).toHaveBeenCalledWith(
                expect.stringContaining("invalid amount"),
            );
            expect(mocks.redeem).not.toHaveBeenCalled();
        });
        it("should return on prompt cancel", async () => {
            promptSpy.mockReturnValue(null);
            await TxRunner(1n, 300n, Mode.supply, {
                amount: null, position: MOCK_POSITION, ctrl: false,
            });
            expect(mocks.redeem).not.toHaveBeenCalled();
        });
        it("should call pool.redeem with token address and amount", async () => {
            await TxRunner(1n, 300n, Mode.supply, {
                amount: 100, position: MOCK_POSITION, ctrl: false,
            });
            expect(mocks.redeem).toHaveBeenCalledWith(
                MOCK_POSITION.address,
                expect.any(BigInt),
            );
        });
        it("should handle CallException on redeem", async () => {
            const error = { reason: "some error", shortMessage: "short", data: null };
            mocks.redeem.mockRejectedValueOnce(error);
            mocks.isCallException.mockReturnValue(true);
            const spy = vi.spyOn(console, "error").mockImplementation(() => {});
            await TxRunner(1n, 300n, Mode.supply, {
                amount: 100, position: MOCK_POSITION, ctrl: false,
            });
            expect(alertSpy).toHaveBeenCalledWith(
                expect.stringContaining("Redeem APOW"),
            );
            spy.mockRestore();
        });
        it("should rethrow non-CallException errors", async () => {
            const error = new Error("network failure");
            mocks.redeem.mockRejectedValueOnce(error);
            mocks.isCallException.mockReturnValue(false);
            await expect(TxRunner(1n, 300n, Mode.supply, {
                amount: 100, position: MOCK_POSITION, ctrl: false,
            })).rejects.toThrow("network failure");
        });
    });

    describe("settle flow", () => {
        it("should fetch token and position balances", async () => {
            await TxRunner(1n, 300n, Mode.borrow, {
                amount: 100, position: MOCK_POSITION, ctrl: false,
            });
            expect(mocks.posTotalOf).toHaveBeenCalled();
            expect(mocks.posLockOf).toHaveBeenCalled();
            expect(mocks.tokenBalanceOf).toHaveBeenCalled();
        });
        it("should check allowance and approve when needed", async () => {
            mocks.allowance.mockResolvedValue(0n);
            await TxRunner(1n, 300n, Mode.borrow, {
                amount: 100, position: MOCK_POSITION, ctrl: false,
            });
            expect(mocks.allowance).toHaveBeenCalled();
            expect(mocks.approve).toHaveBeenCalled();
        });
        it("should skip approve when allowance is sufficient", async () => {
            mocks.allowance.mockResolvedValue(10n ** 30n);
            await TxRunner(1n, 300n, Mode.borrow, {
                amount: 100, position: MOCK_POSITION, ctrl: false,
            });
            expect(mocks.approve).not.toHaveBeenCalled();
        });
        it("should call pool.settle", async () => {
            mocks.allowance.mockResolvedValue(10n ** 30n);
            await TxRunner(1n, 300n, Mode.borrow, {
                amount: 100, position: MOCK_POSITION, ctrl: false,
            });
            expect(mocks.settle).toHaveBeenCalledWith(
                MOCK_POSITION.address,
                expect.any(BigInt),
            );
        });
    });

    describe("call_error parsing", () => {
        it("should parse Locked error", async () => {
            const error = { reason: null, shortMessage: "reverted", data: "0xABC" };
            mocks.redeem.mockRejectedValueOnce(error);
            mocks.isCallException.mockReturnValue(true);
            mocks.parseError.mockReset();
            mocks.parseError.mockReturnValueOnce({
                name: "Locked",
                args: [0n, 100n * 10n ** 18n],
            });
            const spy = vi.spyOn(console, "error").mockImplementation(() => {});
            await TxRunner(1n, 300n, Mode.supply, {
                amount: 100, position: MOCK_POSITION, ctrl: false,
            });
            expect(alertSpy).toHaveBeenCalledWith(
                expect.stringContaining("locked"),
            );
            spy.mockRestore();
        });
        it("should parse ERC4626ExceededMaxRedeem error", async () => {
            const error = { reason: null, shortMessage: "reverted", data: "0xDEF" };
            mocks.redeem.mockRejectedValueOnce(error);
            mocks.isCallException.mockReturnValue(true);
            mocks.parseError.mockReset();
            mocks.parseError
                .mockReturnValueOnce(null) // position ABI
                .mockReturnValueOnce({     // vault ABI
                    name: "ERC4626ExceededMaxRedeem",
                    args: [0n, 0n, 100n * 10n ** 18n],
                });
            const spy = vi.spyOn(console, "error").mockImplementation(() => {});
            await TxRunner(1n, 300n, Mode.supply, {
                amount: 100, position: MOCK_POSITION, ctrl: false,
            });
            expect(alertSpy).toHaveBeenCalledWith(
                expect.stringContaining("max. redeem"),
            );
            spy.mockRestore();
        });
        it("should parse ERC20InsufficientBalance error", async () => {
            const error = { reason: null, shortMessage: "reverted", data: "0x789" };
            mocks.settle.mockRejectedValueOnce(error);
            mocks.isCallException.mockReturnValue(true);
            mocks.allowance.mockResolvedValue(10n ** 30n);
            mocks.parseError.mockReset();
            mocks.parseError
                .mockReturnValueOnce(null)
                .mockReturnValueOnce({
                    name: "ERC20InsufficientBalance",
                    args: [0n, 0n, 200n * 10n ** 18n],
                });
            const spy = vi.spyOn(console, "error").mockImplementation(() => {});
            await TxRunner(1n, 300n, Mode.borrow, {
                amount: 100, position: MOCK_POSITION, ctrl: false,
            });
            expect(alertSpy).toHaveBeenCalledWith(
                expect.stringContaining("balance"),
            );
            spy.mockRestore();
        });
        it("should use fallback for unknown errors", async () => {
            const error = { reason: "unknown", shortMessage: "short msg", data: "0x000" };
            mocks.redeem.mockRejectedValueOnce(error);
            mocks.isCallException.mockReturnValue(true);
            mocks.parseError.mockReset();
            mocks.parseError
                .mockReturnValueOnce(null)
                .mockReturnValueOnce(null);
            const spy = vi.spyOn(console, "error").mockImplementation(() => {});
            await TxRunner(1n, 300n, Mode.supply, {
                amount: 100, position: MOCK_POSITION, ctrl: false,
            });
            expect(alertSpy).toHaveBeenCalledWith(
                expect.stringContaining("Unknown."),
            );
            spy.mockRestore();
        });
    });
});
