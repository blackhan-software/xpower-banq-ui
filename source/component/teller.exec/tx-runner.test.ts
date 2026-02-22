import { describe, expect, it, vi, beforeEach, type Mock } from "vitest";
import { stubGlobals } from "@/test";

stubGlobals();

// --- Mocks that vi.mock factories can reference ---
// vi.hoisted returns values available to hoisted vi.mock calls
const mocks = vi.hoisted(() => ({
    supply: vi.fn().mockResolvedValue({ wait: vi.fn() }),
    borrow: vi.fn().mockResolvedValue({ wait: vi.fn() }),
    vaultOf: vi.fn().mockResolvedValue("0xvault"),
    supplyOf: vi.fn().mockResolvedValue("0xsupply_pos"),
    borrowOf: vi.fn().mockResolvedValue("0xborrow_pos"),
    allowance: vi.fn().mockResolvedValue(0n),
    approve: vi.fn().mockResolvedValue({ wait: vi.fn() }),
    balanceOf: vi.fn().mockResolvedValue(1000n),
    fee: vi.fn().mockResolvedValue({
        entry: 100, entryRecipient: "0x0",
        exit: 200, exitRecipient: "0x0",
    }),
    model: vi.fn().mockResolvedValue([0n, 50000000000000000n]),
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
            supply: mocks.supply,
            borrow: mocks.borrow,
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
            balanceOf: mocks.balanceOf,
        };
    }),
    VaultContract: vi.fn().mockImplementation(function () {
        return { fee: mocks.fee };
    }),
    PositionContract: vi.fn().mockImplementation(function () {
        return { model: mocks.model };
    }),
}));
vi.mock("@/constant", async () => ({
    ...(await import("@/test/constants")).MOCK_CONSTANTS,
    UNIT: 1e18,
}));
vi.mock("@/function", async (importOriginal) =>
    (await import("@/test")).mockFunction(importOriginal)
);
vi.mock("@/contract/pool-abi.json", () => ({ default: [] }));
vi.mock("@/contract/position-abi.json", () => ({ default: [] }));
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

import { TxRunner } from "./tx-runner";
import { Mode, Symbol, Token } from "@/type";

const MOCK_TOKEN: Token = {
    address: "0x0000000000000000000000000000000000000064",
    decimals: 18n,
    supply: 1000000n,
    symbol: Symbol.APOW,
};

describe("TxRunner", () => {
    let alertSpy: Mock;
    let promptSpy: Mock;
    let confirmSpy: Mock;

    beforeEach(() => {
        vi.clearAllMocks();
        alertSpy = vi.fn();
        promptSpy = vi.fn().mockReturnValue("100");
        confirmSpy = vi.fn().mockReturnValue(true);
        vi.stubGlobal("alert", alertSpy);
        vi.stubGlobal("prompt", promptSpy);
        vi.stubGlobal("confirm", confirmSpy);
        mocks.allowance.mockResolvedValue(0n);
        mocks.isCallException.mockReturnValue(false);
        mocks.supply.mockResolvedValue({ wait: vi.fn() });
        mocks.borrow.mockResolvedValue({ wait: vi.fn() });
    });

    describe("routing", () => {
        it("should call supply when mode is supply", async () => {
            await TxRunner(1n, 300n, Mode.supply, {
                signal: null, amount: 100, token: MOCK_TOKEN, ctrl: false,
            });
            expect(mocks.supply).toHaveBeenCalled();
        });
        it("should call borrow when mode is borrow", async () => {
            await TxRunner(1n, 300n, Mode.borrow, {
                signal: null, amount: 100, token: MOCK_TOKEN, ctrl: false,
            });
            expect(mocks.borrow).toHaveBeenCalled();
        });
    });

    describe("supply flow", () => {
        it("should alert on zero amount", async () => {
            await TxRunner(1n, 300n, Mode.supply, {
                signal: null, amount: null, token: MOCK_TOKEN, ctrl: false,
            });
            expect(alertSpy).toHaveBeenCalledWith(
                expect.stringContaining("invalid amount"),
            );
            expect(mocks.supply).not.toHaveBeenCalled();
        });
        it("should return on prompt cancel", async () => {
            promptSpy.mockReturnValue(null);
            await TxRunner(1n, 300n, Mode.supply, {
                signal: null, amount: 100, token: MOCK_TOKEN, ctrl: false,
            });
            expect(mocks.supply).not.toHaveBeenCalled();
        });
        it("should alert if prompt returns 0", async () => {
            promptSpy.mockReturnValue("0");
            await TxRunner(1n, 300n, Mode.supply, {
                signal: null, amount: 100, token: MOCK_TOKEN, ctrl: false,
            });
            expect(alertSpy).toHaveBeenCalledWith(
                expect.stringContaining("invalid amount"),
            );
        });
        it("should check allowance and approve when needed", async () => {
            mocks.allowance.mockResolvedValue(0n);
            await TxRunner(1n, 300n, Mode.supply, {
                signal: null, amount: 100, token: MOCK_TOKEN, ctrl: false,
            });
            expect(mocks.allowance).toHaveBeenCalled();
            expect(mocks.approve).toHaveBeenCalled();
        });
        it("should skip approve when allowance is sufficient", async () => {
            mocks.allowance.mockResolvedValue(10n ** 30n);
            await TxRunner(1n, 300n, Mode.supply, {
                signal: null, amount: 100, token: MOCK_TOKEN, ctrl: false,
            });
            expect(mocks.approve).not.toHaveBeenCalled();
        });
        it("should call pool.supply with correct args", async () => {
            mocks.allowance.mockResolvedValue(10n ** 30n);
            await TxRunner(1n, 300n, Mode.supply, {
                signal: null, amount: 100, token: MOCK_TOKEN, ctrl: false,
            });
            expect(mocks.supply).toHaveBeenCalledWith(
                MOCK_TOKEN.address,
                expect.any(BigInt),
                false,
                { address: "0x1234", signal: null },
            );
        });
        it("should detect lock when prompt ends with !", async () => {
            promptSpy.mockReturnValue("100!");
            mocks.allowance.mockResolvedValue(10n ** 30n);
            await TxRunner(1n, 300n, Mode.supply, {
                signal: null, amount: 100, token: MOCK_TOKEN, ctrl: false,
            });
            expect(confirmSpy).toHaveBeenCalled();
            expect(mocks.supply).toHaveBeenCalledWith(
                MOCK_TOKEN.address,
                expect.any(BigInt),
                true,
                { address: "0x1234", signal: null },
            );
        });
        it("should not supply if lock confirm is rejected", async () => {
            promptSpy.mockReturnValue("100!");
            confirmSpy.mockReturnValue(false);
            mocks.allowance.mockResolvedValue(10n ** 30n);
            await TxRunner(1n, 300n, Mode.supply, {
                signal: null, amount: 100, token: MOCK_TOKEN, ctrl: false,
            });
            expect(mocks.supply).not.toHaveBeenCalled();
        });
        it("should handle CallException on supply", async () => {
            const error = {
                reason: "some reason",
                shortMessage: "short",
                data: null,
            };
            mocks.supply.mockRejectedValueOnce(error);
            mocks.isCallException.mockReturnValue(true);
            mocks.allowance.mockResolvedValue(10n ** 30n);
            const spy = vi.spyOn(console, "error").mockImplementation(() => {});
            await TxRunner(1n, 300n, Mode.supply, {
                signal: null, amount: 100, token: MOCK_TOKEN, ctrl: false,
            });
            expect(alertSpy).toHaveBeenCalledWith(
                expect.stringContaining("APOW"),
            );
            spy.mockRestore();
        });
        it("should rethrow non-CallException errors", async () => {
            const error = new Error("network error");
            mocks.supply.mockRejectedValueOnce(error);
            mocks.isCallException.mockReturnValue(false);
            mocks.allowance.mockResolvedValue(10n ** 30n);
            await expect(TxRunner(1n, 300n, Mode.supply, {
                signal: null, amount: 100, token: MOCK_TOKEN, ctrl: false,
            })).rejects.toThrow("network error");
        });
    });

    describe("borrow flow", () => {
        it("should alert on zero amount", async () => {
            await TxRunner(1n, 300n, Mode.borrow, {
                signal: null, amount: null, token: MOCK_TOKEN, ctrl: false,
            });
            expect(alertSpy).toHaveBeenCalledWith(
                expect.stringContaining("invalid amount"),
            );
            expect(mocks.borrow).not.toHaveBeenCalled();
        });
        it("should return on prompt cancel", async () => {
            promptSpy.mockReturnValue(null);
            await TxRunner(1n, 300n, Mode.borrow, {
                signal: null, amount: 100, token: MOCK_TOKEN, ctrl: false,
            });
            expect(mocks.borrow).not.toHaveBeenCalled();
        });
        it("should call pool.borrow with correct args", async () => {
            await TxRunner(1n, 300n, Mode.borrow, {
                signal: null, amount: 100, token: MOCK_TOKEN, ctrl: false,
            });
            expect(mocks.borrow).toHaveBeenCalledWith(
                MOCK_TOKEN.address,
                expect.any(BigInt),
                false,
                { address: "0x1234", signal: null },
            );
        });
        it("should detect lock on borrow", async () => {
            promptSpy.mockReturnValue("50!");
            await TxRunner(1n, 300n, Mode.borrow, {
                signal: null, amount: 50, token: MOCK_TOKEN, ctrl: false,
            });
            expect(confirmSpy).toHaveBeenCalled();
            expect(mocks.borrow).toHaveBeenCalledWith(
                MOCK_TOKEN.address,
                expect.any(BigInt),
                true,
                { address: "0x1234", signal: null },
            );
        });
    });

    describe("call_error parsing", () => {
        it("should parse AbsoluteCapExceeded", async () => {
            const error = {
                reason: null, shortMessage: "execution reverted", data: "0xABC",
            };
            mocks.supply.mockRejectedValueOnce(error);
            mocks.isCallException.mockReturnValue(true);
            mocks.allowance.mockResolvedValue(10n ** 30n);
            mocks.parseError.mockReset();
            mocks.parseError.mockReturnValueOnce({
                name: "AbsoluteCapExceeded",
                args: [1000n * 10n ** 18n],
            });
            const spy = vi.spyOn(console, "error").mockImplementation(() => {});
            await TxRunner(1n, 300n, Mode.supply, {
                signal: null, amount: 100, token: MOCK_TOKEN, ctrl: false,
            });
            expect(alertSpy).toHaveBeenCalledWith(
                expect.stringContaining("absolute"),
            );
            spy.mockRestore();
        });
        it("should parse RelativeCapExceeded", async () => {
            const error = {
                reason: null, shortMessage: "execution reverted", data: "0xDEF",
            };
            mocks.supply.mockRejectedValueOnce(error);
            mocks.isCallException.mockReturnValue(true);
            mocks.allowance.mockResolvedValue(10n ** 30n);
            mocks.parseError.mockReset();
            mocks.parseError.mockReturnValueOnce({
                name: "RelativeCapExceeded",
                args: [500n * 10n ** 18n],
            });
            const spy = vi.spyOn(console, "error").mockImplementation(() => {});
            await TxRunner(1n, 300n, Mode.supply, {
                signal: null, amount: 100, token: MOCK_TOKEN, ctrl: false,
            });
            expect(alertSpy).toHaveBeenCalledWith(
                expect.stringContaining("relative"),
            );
            spy.mockRestore();
        });
        it("should parse PowLimited", async () => {
            const error = {
                reason: null, shortMessage: "execution reverted", data: "0x123",
            };
            mocks.borrow.mockRejectedValueOnce(error);
            mocks.isCallException.mockReturnValue(true);
            mocks.parseError.mockReset();
            mocks.parseError
                .mockReturnValueOnce(null) // position ABI
                .mockReturnValueOnce({ name: "PowLimited", args: [] }); // pool ABI
            const spy = vi.spyOn(console, "error").mockImplementation(() => {});
            await TxRunner(1n, 300n, Mode.borrow, {
                signal: null, amount: 100, token: MOCK_TOKEN, ctrl: false,
            });
            expect(alertSpy).toHaveBeenCalledWith(
                expect.stringContaining("rate-limited"),
            );
            spy.mockRestore();
        });
        it("should parse RateLimited with duration", async () => {
            const error = {
                reason: null, shortMessage: "execution reverted", data: "0x456",
            };
            mocks.borrow.mockRejectedValueOnce(error);
            mocks.isCallException.mockReturnValue(true);
            mocks.parseError.mockReset();
            mocks.parseError
                .mockReturnValueOnce(null)
                .mockReturnValueOnce({ name: "RateLimited", args: [0n, 300] });
            const spy = vi.spyOn(console, "error").mockImplementation(() => {});
            await TxRunner(1n, 300n, Mode.borrow, {
                signal: null, amount: 100, token: MOCK_TOKEN, ctrl: false,
            });
            expect(alertSpy).toHaveBeenCalledWith(
                expect.stringContaining("rate-limited"),
            );
            spy.mockRestore();
        });
        it("should use fallback for unknown errors", async () => {
            const error = {
                reason: "unknown reason", shortMessage: "short", data: "0x789",
            };
            mocks.supply.mockRejectedValueOnce(error);
            mocks.isCallException.mockReturnValue(true);
            mocks.allowance.mockResolvedValue(10n ** 30n);
            mocks.parseError.mockReset();
            mocks.parseError
                .mockReturnValueOnce(null)
                .mockReturnValueOnce(null);
            const spy = vi.spyOn(console, "error").mockImplementation(() => {});
            await TxRunner(1n, 300n, Mode.supply, {
                signal: null, amount: 100, token: MOCK_TOKEN, ctrl: false,
            });
            expect(alertSpy).toHaveBeenCalledWith(
                expect.stringContaining("Unknown reason."),
            );
            spy.mockRestore();
        });
    });
});
