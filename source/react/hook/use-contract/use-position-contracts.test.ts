// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { stubGlobals } from "@/test";

stubGlobals();

vi.mock("@/constant", async () => ({
    ...(await import("@/test/constants")).MOCK_CONSTANTS,
    GLOBAL: globalThis,
}));
vi.mock("@/function", async (importOriginal) =>
    (await import("@/test")).mockFunction(importOriginal)
);

const TOKEN_A = "0x000000000000000000000000000000000000000a";
const SUPPLY_ADDR = "0x00000000000000000000000000000000000000aa";
const BORROW_ADDR = "0x00000000000000000000000000000000000000bb";
const POOL_TARGET = "0x0000000000000000000000000000000000000001";

const mockSupplyOf = vi.fn().mockResolvedValue(SUPPLY_ADDR);
const mockBorrowOf = vi.fn().mockResolvedValue(BORROW_ADDR);

let mockPoolContract: any = {
    target: POOL_TARGET,
    supplyOf: mockSupplyOf,
    borrowOf: mockBorrowOf,
};
const mockProvider = { provider: null };
let mockTokens: string[] | null = [TOKEN_A];

let capturedMapper: any = null;
let capturedDeps: any = null;

vi.mock("@/react/hook", () => ({
    usePoolContract: () => [mockPoolContract] as const,
    useRemoteProvider: () => [mockProvider] as const,
    usePoolTokens: () => [mockTokens] as const,
    useContracts: (_ctor: any, _opts: any, mapper: any, deps: any) => {
        capturedMapper = mapper;
        capturedDeps = deps;
        return [null] as const;
    },
}));

vi.mock("@/contract", () => ({
    PoolContract: class { },
    PositionContract: class {
        target: string;
        constructor(target: string, _provider: any) {
            this.target = target;
        }
    },
}));

import { usePositionContracts } from "./use-position-contracts";
import { Mode } from "@/type";

describe("usePositionContracts", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        capturedMapper = null;
        capturedDeps = null;
        mockPoolContract = {
            target: POOL_TARGET,
            supplyOf: mockSupplyOf,
            borrowOf: mockBorrowOf,
        };
        mockTokens = [TOKEN_A];
        mockSupplyOf.mockResolvedValue(SUPPLY_ADDR);
        mockBorrowOf.mockResolvedValue(BORROW_ADDR);
    });

    it("should pass mode as additional dependency", () => {
        renderHook(() => usePositionContracts(Mode.supply));
        expect(capturedDeps).toEqual([Mode.supply]);
    });

    it("should pass borrow mode as dependency", () => {
        renderHook(() => usePositionContracts(Mode.borrow));
        expect(capturedDeps).toEqual([Mode.borrow]);
    });

    it("should provide a custom mapper", () => {
        renderHook(() => usePositionContracts(Mode.supply));
        expect(capturedMapper).toBeTypeOf("function");
    });

    it("should return null from mapper when pool_contract is null", async () => {
        mockPoolContract = null;
        renderHook(() => usePositionContracts(Mode.supply));
        const result = await capturedMapper();
        expect(result).toBeNull();
    });

    it("should return null from mapper when tokens is null", async () => {
        mockTokens = null;
        renderHook(() => usePositionContracts(Mode.supply));
        const result = await capturedMapper();
        expect(result).toBeNull();
    });

    it("should call supplyOf for supply mode", async () => {
        renderHook(() => usePositionContracts(Mode.supply));
        await capturedMapper();
        expect(mockSupplyOf).toHaveBeenCalledWith(TOKEN_A);
    });

    it("should call borrowOf for borrow mode", async () => {
        renderHook(() => usePositionContracts(Mode.borrow));
        await capturedMapper();
        expect(mockBorrowOf).toHaveBeenCalledWith(TOKEN_A);
    });

    it("should create PositionContract with resolved address", async () => {
        renderHook(() => usePositionContracts(Mode.supply));
        const result = await capturedMapper();
        expect(result).toHaveLength(1);
        const [_pt, contract] = result[0];
        expect(contract.target).toBe(SUPPLY_ADDR);
    });
});
