// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { stubGlobals } from "@/test";

stubGlobals();

vi.mock("@/constant", async () => ({
    ...(await import("@/test/constants")).MOCK_CONSTANTS,
    GLOBAL: globalThis,
    U224: 2n ** 224n - 1n,
    U256: 2n ** 256n - 1n,
    UNIT: 1e18,
}));
vi.mock("@/function", async (importOriginal) =>
    (await import("@/test")).mockFunction(importOriginal)
);

const ADDR_A = "0x000000000000000000000000000000000000000a";
const MOCK_TOKEN = {
    address: ADDR_A, decimals: 18n, supply: 0n, symbol: "APOW",
};
const MOCK_POOL_ACCOUNT = { pool: 300n, account: 1n };
const MOCK_POSITION = {
    address: ADDR_A, decimals: 18n, supply: 1000n, symbol: "APOW",
    amount: 500_000_000_000_000_000n, // 0.5 token
    cap: {
        supply: [1_000_000_000_000_000_000n, 0n] as [bigint, bigint], // 1 token cap
        borrow: [800_000_000_000_000_000n, 0n] as [bigint, bigint],   // 0.8 token cap
    },
    capTotal: {
        supply: [2_000_000_000_000_000_000n, 0n] as [bigint, bigint],
        borrow: [1_600_000_000_000_000_000n, 0n] as [bigint, bigint],
    },
    lockedTotal: 0n,
    locked: 0n,
};

let mockPositionMap: Map<typeof MOCK_POOL_ACCOUNT, typeof MOCK_POSITION[]> | null = null;
let mockMode = "supply" as "supply" | "borrow";
let mockLimit: number | null = 100;

vi.mock("@/react/hook", () => ({
    useTellerMode: () => [mockMode] as const,
    useTellerToken: () => [MOCK_TOKEN] as const,
    usePoolAccount: () => [MOCK_POOL_ACCOUNT] as const,
    useAmountPositions: () => [mockPositionMap] as const,
    usePortfolioLimit: () => [mockLimit] as const,
}));

import { usePortfolioAmount, usePortfolioAmountRange } from "./use-portfolio-amount";
import { Mode } from "@/type";

describe("usePortfolioAmount", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockMode = Mode.supply;
        mockLimit = 100;
        mockPositionMap = new Map();
        mockPositionMap.set(MOCK_POOL_ACCOUNT, [MOCK_POSITION]);
    });

    it("should return [null] when position map is null", () => {
        mockPositionMap = null;
        const { result } = renderHook(() => usePortfolioAmount());
        expect(result.current[0]).toBeNull();
    });

    it("should return [null] when no positions for pool account", () => {
        mockPositionMap = new Map();
        const { result } = renderHook(() => usePortfolioAmount());
        expect(result.current[0]).toBeNull();
    });

    it("should return [null] when token not found in positions", () => {
        const otherPosition = {
            ...MOCK_POSITION,
            address: "0x000000000000000000000000000000000000000b",
        };
        mockPositionMap = new Map();
        mockPositionMap.set(MOCK_POOL_ACCOUNT, [otherPosition]);
        const { result } = renderHook(() => usePortfolioAmount());
        expect(result.current[0]).toBeNull();
    });

    it("should return min(cap, amount) in supply mode", () => {
        // amount = 500_000_000_000_000_000n => 0.5
        // cap(supply) = 1_000_000_000_000_000_000n => 1.0
        // min(1.0, 0.5) = 0.5
        mockMode = Mode.supply;
        const { result } = renderHook(() => usePortfolioAmount());
        expect(result.current[0]).toBe(0.5);
    });

    it("should return cap when cap < amount", () => {
        // Give position an amount larger than cap
        const bigPosition = {
            ...MOCK_POSITION,
            amount: 2_000_000_000_000_000_000n, // 2.0 tokens
            cap: {
                supply: [1_000_000_000_000_000_000n, 0n] as [bigint, bigint], // 1.0 cap
                borrow: [800_000_000_000_000_000n, 0n] as [bigint, bigint],
            },
        };
        mockPositionMap = new Map();
        mockPositionMap.set(MOCK_POOL_ACCOUNT, [bigPosition]);
        const { result } = renderHook(() => usePortfolioAmount());
        expect(result.current[0]).toBe(1.0);
    });

    it("should use borrow cap in borrow mode", () => {
        mockMode = Mode.borrow;
        const { result } = renderHook(() => usePortfolioAmount());
        // amount = 0.5, borrow cap = 0.8 => min(0.8, 0.5) = 0.5
        expect(result.current[0]).toBe(0.5);
    });
});

describe("usePortfolioAmountRange", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockMode = Mode.supply;
        mockLimit = 100;
        mockPositionMap = new Map();
        mockPositionMap.set(MOCK_POOL_ACCOUNT, [MOCK_POSITION]);
    });

    it("should return [0, balance, step] for supply mode", () => {
        const { result } = renderHook(
            () => usePortfolioAmountRange(Mode.supply),
        );
        const [min, max, step] = result.current;
        expect(min).toBe(0);
        expect(max).toBe(0.5);
        expect(step).toBeCloseTo(0.005);
    });

    it("should return [0, limit, step] for borrow mode", () => {
        const { result } = renderHook(
            () => usePortfolioAmountRange(Mode.borrow),
        );
        const [min, max, step] = result.current;
        expect(min).toBe(0);
        expect(max).toBe(100);
        expect(step).toBe(1);
    });

    it("should return [0, 0, 0] when balance is null in supply mode", () => {
        mockPositionMap = null;
        const { result } = renderHook(
            () => usePortfolioAmountRange(Mode.supply),
        );
        expect(result.current).toEqual([0, 0, 0]);
    });

    it("should return [0, 0, 0] when limit is null in borrow mode", () => {
        mockLimit = null;
        const { result } = renderHook(
            () => usePortfolioAmountRange(Mode.borrow),
        );
        expect(result.current).toEqual([0, 0, 0]);
    });
});
