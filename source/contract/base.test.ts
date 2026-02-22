import { describe, expect, it, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
    getCode: vi.fn().mockResolvedValue("0xDEAD1234BEEF5678"),
    getNetwork: vi.fn().mockResolvedValue({ chainId: 43114n }),
    contractOn: vi.fn(),
    contractOff: vi.fn(),
}));

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

vi.mock("ethers", async () => {
    const actual = await vi.importActual("ethers");
    return {
        ...actual,
        Contract: vi.fn().mockImplementation(function () {
            return {
                on: mocks.contractOn,
                off: mocks.contractOff,
                target: "0xTARGET",
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

import { BaseContract } from "./base";
import { ContractRunner, InterfaceAbi } from "ethers";

class TestContract extends BaseContract {
    override get abi(): InterfaceAbi {
        return [];
    }
}

function createRunner() {
    return {
        provider: {
            getCode: mocks.getCode,
            getNetwork: mocks.getNetwork,
        },
        call: vi.fn().mockResolvedValue("0x"),
    } as unknown as ContractRunner;
}

describe("BaseContract", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal("localStorage", createStorage());
    });
    describe("constructor", () => {
        it("should store target", () => {
            const c = new TestContract("0xABC", null);
            expect(c.target).toBe("0xABC");
        });
        it("should store runner", () => {
            const runner = createRunner();
            const c = new TestContract("0xABC", runner);
            expect(c.runner).toBe(runner);
        });
        it("should accept null runner", () => {
            const c = new TestContract("0xABC", null);
            expect(c.runner).toBeNull();
        });
    });
    describe("contract", () => {
        it("should lazily create contract on first access", () => {
            const c = new TestContract("0xABC", createRunner());
            const contract = c.contract;
            expect(contract).toBeDefined();
            expect(contract.target).toBe("0xTARGET");
        });
        it("should return same instance on repeated access", () => {
            const c = new TestContract("0xABC", createRunner());
            const first = c.contract;
            const second = c.contract;
            expect(first).toBe(second);
        });
    });
    describe("code", () => {
        it("should fetch code from provider and cache in localStorage", async () => {
            const c = new TestContract("0xABC", createRunner());
            const code = await c.code();
            expect(code).toBe("0xDEAD1234BEEF5678");
            expect(mocks.getCode).toHaveBeenCalledWith("0xABC");
            expect(localStorage.setItem).toHaveBeenCalled();
        });
        it("should return cached code from localStorage", async () => {
            const c = new TestContract("0xABC", createRunner());
            await c.code();
            mocks.getCode.mockClear();
            const c2 = new TestContract("0xABC", createRunner());
            const code = await c2.code();
            expect(code).toBe("0xDEAD1234BEEF5678");
            expect(mocks.getCode).not.toHaveBeenCalled();
        });
        it("should return null when no runner provider", async () => {
            const c = new TestContract("0xABC", null);
            const code = await c.code();
            expect(code).toBeNull();
        });
    });
    describe("with", () => {
        it("should return true when selector found in code", async () => {
            const c = new TestContract("0xABC", createRunner());
            const result = await c.with("DEAD");
            expect(result).toBe(true);
        });
        it("should return false when selector not found", async () => {
            const c = new TestContract("0xABC", createRunner());
            const result = await c.with("FFFF9999");
            expect(result).toBe(false);
        });
        it("should cache the result for repeated calls", async () => {
            const c = new TestContract("0xABC", createRunner());
            await c.with("DEAD");
            mocks.getCode.mockClear();
            const result = await c.with("DEAD");
            expect(result).toBe(true);
            expect(mocks.getCode).not.toHaveBeenCalled();
        });
        it("should return null when no code available", async () => {
            const c = new TestContract("0xABC", null);
            const result = await c.with("DEAD");
            expect(result).toBeNull();
        });
    });
});
