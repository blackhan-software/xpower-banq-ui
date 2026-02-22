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
    borrowOf: vi.fn().mockResolvedValue("0xBORROW_POS"),
    supplyOf: vi.fn().mockResolvedValue("0xSUPPLY_POS"),
    vaultOf: vi.fn().mockResolvedValue("0xVAULT_ADDR"),
    tokens: vi.fn().mockResolvedValue(["0xTOKEN_A", "0xTOKEN_B"]),
    healthOf: vi.fn().mockResolvedValue([100n, 200n]),
    capSupplyOf: vi.fn().mockResolvedValue([1000n, 60n]),
    capBorrowOf: vi.fn().mockResolvedValue([500n, 30n]),
    capSupply: vi.fn().mockResolvedValue([2000n, 120n]),
    capBorrow: vi.fn().mockResolvedValue([1000n, 90n]),
    redeem: vi.fn().mockResolvedValue({ hash: "0xREDEEM" }),
    settle: vi.fn().mockResolvedValue({ hash: "0xSETTLE" }),
    supplyDifficultyOf: vi.fn().mockResolvedValue(0n),
    borrowDifficultyOf: vi.fn().mockResolvedValue(0n),
    supplyLock: vi.fn().mockResolvedValue({ hash: "0xSUPPLY_LOCK" }),
    supplyNoLock: vi.fn().mockResolvedValue({ hash: "0xSUPPLY" }),
    borrowLock: vi.fn().mockResolvedValue({ hash: "0xBORROW_LOCK" }),
    borrowNoLock: vi.fn().mockResolvedValue({ hash: "0xBORROW" }),
    getNetwork: vi.fn().mockResolvedValue({ chainId: 43114n }),
}));

vi.mock("ethers", async () => {
    const actual = await vi.importActual("ethers");
    return {
        ...actual,
        Contract: vi.fn().mockImplementation(function () {
            return {
                borrowOf: mocks.borrowOf,
                supplyOf: mocks.supplyOf,
                vaultOf: mocks.vaultOf,
                tokens: mocks.tokens,
                healthOf: mocks.healthOf,
                capSupplyOf: mocks.capSupplyOf,
                capBorrowOf: mocks.capBorrowOf,
                capSupply: mocks.capSupply,
                capBorrow: mocks.capBorrow,
                redeem: mocks.redeem,
                settle: mocks.settle,
                supplyDifficultyOf: mocks.supplyDifficultyOf,
                borrowDifficultyOf: mocks.borrowDifficultyOf,
                "supply(address,uint256,bool)": mocks.supplyLock,
                "supply(address,uint256)": mocks.supplyNoLock,
                "borrow(address,uint256,bool)": mocks.borrowLock,
                "borrow(address,uint256)": mocks.borrowNoLock,
                target: "0xPOOL",
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
vi.mock("@blackhan-software/wasm-miner", () => ({
    KeccakHasher: vi.fn(),
}));

import { PoolContract } from "./pool";
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

describe("PoolContract", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal("sessionStorage", createStorage());
    });
    it("should have an abi", () => {
        const pool = new PoolContract("0xPOOL", createRunner());
        expect(pool.abi).toBeDefined();
        expect(Array.isArray(pool.abi)).toBe(true);
    });
    describe("borrowOf (caching)", () => {
        it("should call contract and cache in sessionStorage", async () => {
            const pool = new PoolContract("0xPOOL", createRunner());
            const addr = await pool.borrowOf("0xTOKEN");
            expect(addr).toBe("0xBORROW_POS");
            expect(mocks.borrowOf).toHaveBeenCalledWith("0xTOKEN");
        });
        it("should return cached value on second call", async () => {
            const pool = new PoolContract("0xPOOL", createRunner());
            await pool.borrowOf("0xTOKEN");
            mocks.borrowOf.mockClear();
            const addr = await pool.borrowOf("0xTOKEN");
            expect(addr).toBe("0xBORROW_POS");
            expect(mocks.borrowOf).not.toHaveBeenCalled();
        });
    });
    describe("supplyOf (caching)", () => {
        it("should call contract and cache in sessionStorage", async () => {
            const pool = new PoolContract("0xPOOL", createRunner());
            const addr = await pool.supplyOf("0xTOKEN");
            expect(addr).toBe("0xSUPPLY_POS");
            expect(mocks.supplyOf).toHaveBeenCalledWith("0xTOKEN");
        });
        it("should return cached value on second call", async () => {
            const pool = new PoolContract("0xPOOL", createRunner());
            await pool.supplyOf("0xTOKEN");
            mocks.supplyOf.mockClear();
            const addr = await pool.supplyOf("0xTOKEN");
            expect(addr).toBe("0xSUPPLY_POS");
            expect(mocks.supplyOf).not.toHaveBeenCalled();
        });
    });
    describe("vaultOf (caching)", () => {
        it("should call contract and cache in sessionStorage", async () => {
            const pool = new PoolContract("0xPOOL", createRunner());
            const addr = await pool.vaultOf("0xTOKEN");
            expect(addr).toBe("0xVAULT_ADDR");
            expect(mocks.vaultOf).toHaveBeenCalledWith("0xTOKEN");
        });
        it("should return cached value on second call", async () => {
            const pool = new PoolContract("0xPOOL", createRunner());
            await pool.vaultOf("0xTOKEN");
            mocks.vaultOf.mockClear();
            const addr = await pool.vaultOf("0xTOKEN");
            expect(addr).toBe("0xVAULT_ADDR");
            expect(mocks.vaultOf).not.toHaveBeenCalled();
        });
    });
    describe("tokens (caching)", () => {
        it("should call contract and cache as JSON", async () => {
            const pool = new PoolContract("0xPOOL", createRunner());
            const tokens = await pool.tokens();
            expect(tokens).toEqual(["0xTOKEN_A", "0xTOKEN_B"]);
            expect(mocks.tokens).toHaveBeenCalled();
        });
        it("should return cached value on second call", async () => {
            const pool = new PoolContract("0xPOOL", createRunner());
            await pool.tokens();
            mocks.tokens.mockClear();
            const tokens = await pool.tokens();
            expect(tokens).toEqual(["0xTOKEN_A", "0xTOKEN_B"]);
            expect(mocks.tokens).not.toHaveBeenCalled();
        });
    });
    describe("delegation", () => {
        it("should delegate healthOf", async () => {
            const pool = new PoolContract("0xPOOL", createRunner());
            const result = await pool.healthOf("0xUSER");
            expect(result).toEqual([100n, 200n]);
            expect(mocks.healthOf).toHaveBeenCalledWith("0xUSER");
        });
        it("should delegate capSupplyOf", async () => {
            const pool = new PoolContract("0xPOOL", createRunner());
            const [limit, dt] = await pool.capSupplyOf("0xUSER", "0xTOKEN");
            expect(limit).toBe(1000n);
            expect(dt).toBe(60n);
        });
        it("should delegate capBorrowOf", async () => {
            const pool = new PoolContract("0xPOOL", createRunner());
            const [limit, dt] = await pool.capBorrowOf("0xUSER", "0xTOKEN");
            expect(limit).toBe(500n);
            expect(dt).toBe(30n);
        });
        it("should delegate capSupply", async () => {
            const pool = new PoolContract("0xPOOL", createRunner());
            const [limit, dt] = await pool.capSupply("0xTOKEN");
            expect(limit).toBe(2000n);
            expect(dt).toBe(120n);
        });
        it("should delegate capBorrow", async () => {
            const pool = new PoolContract("0xPOOL", createRunner());
            const [limit, dt] = await pool.capBorrow("0xTOKEN");
            expect(limit).toBe(1000n);
            expect(dt).toBe(90n);
        });
        it("should delegate redeem", async () => {
            const pool = new PoolContract("0xPOOL", createRunner());
            const tx = await pool.redeem("0xTOKEN", 100n);
            expect(tx).toEqual({ hash: "0xREDEEM" });
            expect(mocks.redeem).toHaveBeenCalledWith("0xTOKEN", 100n);
        });
        it("should delegate settle", async () => {
            const pool = new PoolContract("0xPOOL", createRunner());
            const tx = await pool.settle("0xTOKEN", 100n);
            expect(tx).toEqual({ hash: "0xSETTLE" });
            expect(mocks.settle).toHaveBeenCalledWith("0xTOKEN", 100n);
        });
    });
    describe("supply (no PoW)", () => {
        it("should call supply with lock when lock=true", async () => {
            const pool = new PoolContract("0xPOOL", createRunner());
            const tx = await pool.supply("0xTOKEN", 100n, true, {
                address: "0xUSER", signal: null,
            });
            expect(tx).toEqual({ hash: "0xSUPPLY_LOCK" });
            expect(mocks.supplyLock).toHaveBeenCalledWith("0xTOKEN", 100n, true);
        });
        it("should call supply without lock when lock=false", async () => {
            const pool = new PoolContract("0xPOOL", createRunner());
            const tx = await pool.supply("0xTOKEN", 100n, false, {
                address: "0xUSER", signal: null,
            });
            expect(tx).toEqual({ hash: "0xSUPPLY" });
            expect(mocks.supplyNoLock).toHaveBeenCalledWith("0xTOKEN", 100n);
        });
    });
    describe("borrow (no PoW)", () => {
        it("should call borrow with lock when lock=true", async () => {
            const pool = new PoolContract("0xPOOL", createRunner());
            const tx = await pool.borrow("0xTOKEN", 100n, true, {
                address: "0xUSER", signal: null,
            });
            expect(tx).toEqual({ hash: "0xBORROW_LOCK" });
            expect(mocks.borrowLock).toHaveBeenCalledWith("0xTOKEN", 100n, true);
        });
        it("should call borrow without lock when lock=false", async () => {
            const pool = new PoolContract("0xPOOL", createRunner());
            const tx = await pool.borrow("0xTOKEN", 100n, false, {
                address: "0xUSER", signal: null,
            });
            expect(tx).toEqual({ hash: "0xBORROW" });
            expect(mocks.borrowNoLock).toHaveBeenCalledWith("0xTOKEN", 100n);
        });
    });
});
