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
    amount: 500n,
    cap: {
        supply: [1000n, 0n] as [bigint, bigint],
        borrow: [800n, 0n] as [bigint, bigint],
    },
    capTotal: {
        supply: [2000n, 0n] as [bigint, bigint],
        borrow: [1600n, 0n] as [bigint, bigint],
    },
    lockedTotal: 0n,
    locked: 0n,
};

let mockPositionMap: Map<typeof MOCK_POOL_ACCOUNT, typeof MOCK_POSITION[]> | null = null;
let mockMode = "supply" as "supply" | "borrow";

vi.mock("@/react/hook", () => ({
    useTellerMode: () => [mockMode] as const,
    useTellerToken: () => [MOCK_TOKEN] as const,
    usePoolAccount: () => [MOCK_POOL_ACCOUNT] as const,
    useAmountPositions: () => [mockPositionMap] as const,
}));

import { usePortfolioCap } from "./use-portfolio-cap";
import { Mode } from "@/type";

describe("usePortfolioCap", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockMode = Mode.supply;
        mockPositionMap = new Map();
        mockPositionMap.set(MOCK_POOL_ACCOUNT, [MOCK_POSITION]);
    });

    it("should return [null] when position map is null", () => {
        mockPositionMap = null;
        const { result } = renderHook(() => usePortfolioCap());
        expect(result.current[0]).toBeNull();
    });

    it("should return [null] when no positions for pool account", () => {
        mockPositionMap = new Map();
        const { result } = renderHook(() => usePortfolioCap());
        expect(result.current[0]).toBeNull();
    });

    it("should return [null] when token not found in positions", () => {
        const otherPosition = {
            ...MOCK_POSITION,
            address: "0x000000000000000000000000000000000000000b",
        };
        mockPositionMap = new Map();
        mockPositionMap.set(MOCK_POOL_ACCOUNT, [otherPosition]);
        const { result } = renderHook(() => usePortfolioCap());
        expect(result.current[0]).toBeNull();
    });

    it("should return supply cap for supply mode", () => {
        mockMode = Mode.supply;
        const { result } = renderHook(() => usePortfolioCap());
        // Position.cap returns [Number(1000n)/Number(10n**18n), Number(0n)]
        expect(result.current[0]).toBeDefined();
        expect(result.current[0]![0]).toBe(
            Number(1000n) / Number(10n ** 18n),
        );
    });

    it("should return borrow cap for borrow mode", () => {
        mockMode = Mode.borrow;
        const { result } = renderHook(() => usePortfolioCap());
        expect(result.current[0]).toBeDefined();
        expect(result.current[0]![0]).toBe(
            Number(800n) / Number(10n ** 18n),
        );
    });
});
