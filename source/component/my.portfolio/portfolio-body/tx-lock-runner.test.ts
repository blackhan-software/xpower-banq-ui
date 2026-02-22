import { describe, expect, it, vi, beforeEach, type Mock } from "vitest";
import { stubGlobals } from "@/test";

stubGlobals();

const mocks = vi.hoisted(() => ({
    lockSupply: vi.fn().mockResolvedValue({ wait: vi.fn() }),
    lockBorrow: vi.fn().mockResolvedValue({ wait: vi.fn() }),
    supplyOf: vi.fn().mockResolvedValue("0xsupply_pos"),
    borrowOf: vi.fn().mockResolvedValue("0xborrow_pos"),
    posTotalOf: vi.fn().mockResolvedValue(500n * 10n ** 18n),
    posLockOf: vi.fn().mockResolvedValue(100n * 10n ** 18n),
    posModel: vi.fn().mockResolvedValue([0n, 50000000000000000n]),
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
            lockSupply: mocks.lockSupply,
            lockBorrow: mocks.lockBorrow,
            supplyOf: mocks.supplyOf,
            borrowOf: mocks.borrowOf,
        };
    }),
    ERC20Contract: vi.fn().mockImplementation(function () {
        return { target: "0xtoken" };
    }),
    PositionContract: vi.fn().mockImplementation(function () {
        return {
            totalOf: mocks.posTotalOf,
            lockOf: mocks.posLockOf,
            model: mocks.posModel,
        };
    }),
}));
vi.mock("@/constant", async () =>
    (await import("@/test/constants")).MOCK_CONSTANTS
);
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

import { TxLockRunner } from "./tx-lock-runner";
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

describe("TxLockRunner (portfolio-body)", () => {
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
        mocks.isCallException.mockReturnValue(false);
        mocks.lockSupply.mockResolvedValue({ wait: vi.fn() });
        mocks.lockBorrow.mockResolvedValue({ wait: vi.fn() });
    });

    describe("routing", () => {
        it("should call lockSupply when mode is supply", async () => {
            await TxLockRunner(1n, 300n, Mode.supply, {
                position: MOCK_POSITION,
            });
            expect(mocks.lockSupply).toHaveBeenCalled();
        });
        it("should call lockBorrow when mode is borrow", async () => {
            await TxLockRunner(1n, 300n, Mode.borrow, {
                position: MOCK_POSITION,
            });
            expect(mocks.lockBorrow).toHaveBeenCalled();
        });
    });

    describe("lock supply flow", () => {
        it("should fetch position balances", async () => {
            await TxLockRunner(1n, 300n, Mode.supply, {
                position: MOCK_POSITION,
            });
            expect(mocks.posTotalOf).toHaveBeenCalled();
            expect(mocks.posLockOf).toHaveBeenCalled();
        });
        it("should return on prompt cancel", async () => {
            promptSpy.mockReturnValue(null);
            await TxLockRunner(1n, 300n, Mode.supply, {
                position: MOCK_POSITION,
            });
            expect(mocks.lockSupply).not.toHaveBeenCalled();
        });
        it("should alert on zero amount", async () => {
            promptSpy.mockReturnValue("0");
            await TxLockRunner(1n, 300n, Mode.supply, {
                position: MOCK_POSITION,
            });
            expect(alertSpy).toHaveBeenCalledWith(
                expect.stringContaining("invalid amount"),
            );
            expect(mocks.lockSupply).not.toHaveBeenCalled();
        });
        it("should return when confirm is rejected", async () => {
            confirmSpy.mockReturnValue(false);
            await TxLockRunner(1n, 300n, Mode.supply, {
                position: MOCK_POSITION,
            });
            expect(mocks.lockSupply).not.toHaveBeenCalled();
        });
        it("should call pool.lockSupply with token and amount", async () => {
            await TxLockRunner(1n, 300n, Mode.supply, {
                position: MOCK_POSITION,
            });
            expect(mocks.lockSupply).toHaveBeenCalledWith(
                MOCK_POSITION.address,
                expect.any(BigInt),
            );
        });
        it("should handle CallException on lockSupply", async () => {
            const error = { reason: "some error", shortMessage: "short", data: null };
            mocks.lockSupply.mockRejectedValueOnce(error);
            mocks.isCallException.mockReturnValue(true);
            const spy = vi.spyOn(console, "error").mockImplementation(() => {});
            await TxLockRunner(1n, 300n, Mode.supply, {
                position: MOCK_POSITION,
            });
            expect(alertSpy).toHaveBeenCalledWith(
                expect.stringContaining("Lock APOW"),
            );
            spy.mockRestore();
        });
        it("should rethrow non-CallException errors", async () => {
            const error = new Error("network failure");
            mocks.lockSupply.mockRejectedValueOnce(error);
            mocks.isCallException.mockReturnValue(false);
            await expect(TxLockRunner(1n, 300n, Mode.supply, {
                position: MOCK_POSITION,
            })).rejects.toThrow("network failure");
        });
    });

    describe("lock borrow flow", () => {
        it("should call pool.lockBorrow with token and amount", async () => {
            await TxLockRunner(1n, 300n, Mode.borrow, {
                position: MOCK_POSITION,
            });
            expect(mocks.lockBorrow).toHaveBeenCalledWith(
                MOCK_POSITION.address,
                expect.any(BigInt),
            );
        });
        it("should handle CallException on lockBorrow", async () => {
            const error = { reason: "lock error", shortMessage: "short", data: null };
            mocks.lockBorrow.mockRejectedValueOnce(error);
            mocks.isCallException.mockReturnValue(true);
            const spy = vi.spyOn(console, "error").mockImplementation(() => {});
            await TxLockRunner(1n, 300n, Mode.borrow, {
                position: MOCK_POSITION,
            });
            expect(alertSpy).toHaveBeenCalledWith(
                expect.stringContaining("Lock APOW"),
            );
            spy.mockRestore();
        });
    });
});
